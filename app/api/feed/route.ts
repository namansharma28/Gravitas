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

    let feedItems = [];

    if (session?.user?.id) {
      // Get communities user follows or is a member of
      const userCommunities = await db.collection('communities').find({
        $or: [
          { members: session.user.id },
          { admins: session.user.id }
        ]
      }).toArray();

      const followedCommunities = await db.collection('follows').find({
        userId: session.user.id
      }).toArray();

      const allCommunityIds = [
        ...userCommunities.map(c => c._id.toString()),
        ...followedCommunities.map(f => f.communityId)
      ];

      // Get recent events and updates from these communities
      const [events, updates] = await Promise.all([
        // Recent events
        db.collection('events')
          .aggregate([
            {
              $match: {
                communityId: { $in: allCommunityIds },
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
            { $sort: { createdAt: -1 } },
            { $limit: 10 }
          ])
          .toArray(),

        // Recent updates
        db.collection('updates')
          .aggregate([
            {
              $match: {
                communityId: { $in: allCommunityIds },
                $or: [
                  { visibility: 'everyone' },
                  {
                    $and: [
                      { visibility: 'members' },
                      { communityId: { $in: userCommunities.map(c => c._id.toString()) } }
                    ]
                  }
                ]
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
            { $sort: { createdAt: -1 } },
            { $limit: 10 }
          ])
          .toArray()
      ]);

      // Combine and format feed items
      feedItems = [
        ...events.map(event => ({
          _id: event._id.toString(),
          type: 'event' as const,
          title: event.title,
          content: event.description,
          community: {
            name: event.community.name,
            handle: event.community.handle,
            avatar: event.community.avatar,
          },
          createdAt: event.createdAt || new Date().toISOString(),
          eventDate: `${event.date} • ${event.time}`,
          image: event.image,
        })),
        ...updates.map(update => ({
          _id: update._id.toString(),
          type: 'update' as const,
          title: update.title,
          content: update.content,
          community: {
            name: update.community.name,
            handle: update.community.handle,
            avatar: update.community.avatar,
          },
          createdAt: update.createdAt,
          eventId: update.eventId,
        }))
      ];
    } else {
      // For non-authenticated users, show popular events and public updates
      const [popularEvents, publicUpdates] = await Promise.all([
        // Popular upcoming events
        db.collection('events')
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
            { $limit: 5 }
          ])
          .toArray(),

        // Public updates
        db.collection('updates')
          .aggregate([
            {
              $match: { visibility: 'everyone' }
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
            { $sort: { createdAt: -1 } },
            { $limit: 5 }
          ])
          .toArray()
      ]);

      // Combine and format feed items
      feedItems = [
        ...popularEvents.map(event => ({
          _id: event._id.toString(),
          type: 'event' as const,
          title: event.title,
          content: event.description,
          community: {
            name: event.community.name,
            handle: event.community.handle,
            avatar: event.community.avatar,
          },
          createdAt: event.createdAt || new Date().toISOString(),
          eventDate: `${event.date} • ${event.time}`,
          image: event.image,
        })),
        ...publicUpdates.map(update => ({
          _id: update._id.toString(),
          type: 'update' as const,
          title: update.title,
          content: update.content,
          community: {
            name: update.community.name,
            handle: update.community.handle,
            avatar: update.community.avatar,
          },
          createdAt: update.createdAt,
          eventId: update.eventId,
        }))
      ];
    }

    // Sort by creation date
    feedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(feedItems.slice(0, 20));
  } catch (error: any) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}