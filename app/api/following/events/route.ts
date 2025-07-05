import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get communities user follows
    const followedCommunities = await db.collection('follows')
      .find({ userId: session.user.id })
      .toArray();

    const followedCommunityIds = followedCommunities.map(f => f.communityId);

    // Get upcoming events from followed communities
    const upcomingEvents = await db.collection('events')
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
                      { $eq: ['$userId', { $toObjectId: session.user.id }] }
                    ]
                  }
                }
              }
            ],
            as: 'userRegistration'
          }
        },
        { $sort: { date: 1, time: 1 } }
      ])
      .toArray();

    // Transform the data
    const transformedEvents = upcomingEvents.map(event => {
      const community = event.community[0];
      return {
        _id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        image: event.image,
        community: {
          name: community?.name || 'Unknown Community',
          handle: community?.handle || 'unknown',
          avatar: community?.avatar || '',
        },
        registrationCount: event.registrationCount[0]?.count || 0,
        capacity: event.capacity,
        userRegistered: event.userRegistration.length > 0,
      };
    });

    return NextResponse.json(transformedEvents);
  } catch (error: any) {
    console.error('Error fetching followed events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch followed events' },
      { status: 500 }
    );
  }
}