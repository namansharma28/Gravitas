import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const filter = searchParams.get('filter') || 'all';
    const communityId = searchParams.get('community');

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get user's communities (member and admin)
    const userCommunities = await db.collection('communities').find({
      $or: [
        { members: session.user.id },
        { admins: session.user.id }
      ]
    }).toArray();

    const userCommunityIds = userCommunities.map(c => c._id.toString());

    // Get communities user follows
    const followedCommunities = await db.collection('follows').find({
      userId: session.user.id
    }).toArray();

    const followedCommunityIds = followedCommunities.map(f => f.communityId);

    // Build event query
    let eventQuery: any = {};

    // Date range filter
    if (startDate && endDate) {
      eventQuery.$or = [
        {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        },
        // Include multi-day events that span into this range
        {
          isMultiDay: true,
          $and: [
            { date: { $lte: endDate } },
            { endDate: { $gte: startDate } }
          ]
        }
      ];
    }

    // Community filter
    if (communityId && communityId !== 'all') {
      eventQuery.communityId = communityId;
    }

    // Get all relevant events
    const events = await db.collection('events')
      .aggregate([
        { $match: eventQuery },
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

    // Filter and transform events based on user's relationship
    const filteredEvents = events
      .filter(event => {
        const community = event.community[0];
        if (!community) return false;

        const communityId = community._id.toString();
        const isMember = userCommunityIds.includes(communityId);
        const isFollower = followedCommunityIds.includes(communityId);
        const isAdmin = community.admins.includes(session.user.id);
        const userRegistered = event.userRegistration.length > 0;

        // Apply filter
        switch (filter) {
          case 'registered':
            return userRegistered;
          case 'member':
            return isMember || isAdmin;
          case 'follower':
            return isFollower;
          case 'all':
          default:
            return isMember || isFollower || isAdmin || userRegistered;
        }
      })
      .map(event => {
        const community = event.community[0];
        const communityId = community._id.toString();
        const isMember = userCommunityIds.includes(communityId);
        const isAdmin = community.admins.includes(session.user.id);
        const isFollower = followedCommunityIds.includes(communityId);
        const userRegistered = event.userRegistration.length > 0;

        let userRelation = 'other';
        if (isAdmin) userRelation = 'admin';
        else if (isMember) userRelation = 'member';
        else if (isFollower) userRelation = 'follower';

        return {
          id: event._id.toString(),
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          capacity: event.capacity,
          image: event.image,
          isMultiDay: event.isMultiDay || false,
          endDate: event.endDate,
          community: {
            id: community._id.toString(),
            name: community.name,
            handle: community.handle,
            avatar: community.avatar,
          },
          registrationCount: event.registrationCount[0]?.count || 0,
          userRegistered,
          userRelation,
        };
      });

    return NextResponse.json(filteredEvents);
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}