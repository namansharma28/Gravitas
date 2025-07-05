import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    const client = await clientPromise;
    const db = client.db('gravitas');

    let upcomingEvents = [];

    if (session?.user?.id) {
      // Get events user is registered for
      const registeredEvents = await db.collection('eventRegistrations')
        .aggregate([
          { $match: { userId: new ObjectId(session.user.id) } },
          {
            $lookup: {
              from: 'events',
              localField: 'eventId',
              foreignField: '_id',
              as: 'event'
            }
          },
          { $unwind: '$event' },
          {
            $match: {
              'event.date': { $gte: new Date().toISOString().split('T')[0] }
            }
          },
          {
            $lookup: {
              from: 'communities',
              let: { communityId: { $toObjectId: '$event.communityId' } },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$communityId'] } } }
              ],
              as: 'community'
            }
          },
          { $unwind: '$community' },
          { $sort: { 'event.date': 1, 'event.time': 1 } },
          { $limit: 3 }
        ])
        .toArray();

      // Transform registered events
      const transformedRegisteredEvents = registeredEvents.map(item => ({
        _id: item.event._id.toString(),
        title: item.event.title,
        date: item.event.date,
        time: item.event.time,
        community: {
          name: item.community.name,
          handle: item.community.handle,
          avatar: item.community.avatar,
        },
        image: item.event.image,
        userRegistered: true,
      }));

      // If we have fewer than 3 registered events, get additional events from communities user follows
      if (transformedRegisteredEvents.length < 3) {
        // Get communities user follows
        const followedCommunities = await db.collection('follows')
          .find({ userId: session.user.id })
          .toArray();

        const followedCommunityIds = followedCommunities.map(f => f.communityId);

        // Get upcoming events from followed communities
        const additionalEvents = await db.collection('events')
          .aggregate([
            {
              $match: {
                communityId: { $in: followedCommunityIds },
                date: { $gte: new Date().toISOString().split('T')[0] }
              }
            },
            {
              $lookup: {
                from: 'communities',
                let: { communityId: { $toObjectId: '$communityId' } },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$communityId'] } } }
                ],
                as: 'community'
              }
            },
            { $unwind: '$community' },
            {
              $lookup: {
                from: 'eventRegistrations',
                let: { eventId: '$_id' },
                pipeline: [
                  { 
                    $match: { 
                      $expr: { 
                        $and: [
                          { $eq: ['$eventId', '$$eventId'] },
                          { $eq: ['$userId', new ObjectId(session.user.id)] }
                        ]
                      }
                    }
                  }
                ],
                as: 'userRegistration'
              }
            },
            { $match: { 'userRegistration': { $size: 0 } } }, // Exclude events user is already registered for
            { $sort: { date: 1, time: 1 } },
            { $limit: 3 - transformedRegisteredEvents.length }
          ])
          .toArray();

        // Transform additional events
        const transformedAdditionalEvents = additionalEvents.map(event => ({
          _id: event._id.toString(),
          title: event.title,
          date: event.date,
          time: event.time,
          community: {
            name: event.community.name,
            handle: event.community.handle,
            avatar: event.community.avatar,
          },
          image: event.image,
          userRegistered: false,
        }));

        // Combine registered and additional events
        upcomingEvents = [...transformedRegisteredEvents, ...transformedAdditionalEvents];
      } else {
        upcomingEvents = transformedRegisteredEvents;
      }
    } else {
      // For non-authenticated users, show popular upcoming events
      const popularEvents = await db.collection('events')
        .aggregate([
          {
            $match: {
              date: { $gte: new Date().toISOString().split('T')[0] }
            }
          },
          {
            $lookup: {
              from: 'communities',
              let: { communityId: { $toObjectId: '$communityId' } },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$communityId'] } } }
              ],
              as: 'community'
            }
          },
          { $unwind: '$community' },
          {
            $lookup: {
              from: 'eventRegistrations',
              let: { eventId: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$eventId', '$$eventId'] } } },
                { $count: 'count' }
              ],
              as: 'registrationCount'
            }
          },
          { $sort: { 'registrationCount.count': -1, date: 1 } },
          { $limit: 3 }
        ])
        .toArray();

      // Transform popular events
      upcomingEvents = popularEvents.map(event => ({
        _id: event._id.toString(),
        title: event.title,
        date: event.date,
        time: event.time,
        community: {
          name: event.community.name,
          handle: event.community.handle,
          avatar: event.community.avatar,
        },
        image: event.image,
        userRegistered: false,
      }));
    }

    return NextResponse.json(upcomingEvents);
  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch upcoming events' },
      { status: 500 }
    );
  }
}