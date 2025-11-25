import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { apiCache, CACHE_TTL, generateCacheKey } from '@/lib/cache';
import { trackDBQuery } from '@/lib/performance';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Generate cache key based on user and pagination
    const userId = session?.user?.id || 'anonymous';
    const cacheKey = generateCacheKey('feed', { userId, page, limit });
    
    // Try to get from cache (shorter TTL for feed as it's dynamic)
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'private, max-age=60',
        },
      });
    }
    
    const client = await clientPromise;
    const db = client.db('gravitas');

    let feedItems = [];

    if (session?.user?.id) {
      // Optimize: Get community IDs in a single query
      const [userCommunities, followedCommunities] = await trackDBQuery('get-user-communities', async () => {
        return Promise.all([
          db.collection('communities')
            .find(
              {
                $or: [
                  { members: session.user.id },
                  { admins: session.user.id }
                ]
              },
              { projection: { _id: 1 } } // Only get IDs
            )
            .toArray(),
          db.collection('follows')
            .find(
              { userId: session.user.id },
              { projection: { communityId: 1 } } // Only get communityId
            )
            .toArray()
        ]);
      });

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
                  },
                  {
                    $and: [
                      { visibility: 'shortlisted' },
                      { targetFormId: { $exists: true } }
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
            {
              $lookup: {
                from: 'events',
                let: { eventId: { $toObjectId: '$eventId' } },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$eventId'] } } }
                ],
                as: 'event'
              }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 10 }
          ])
          .toArray()
      ]);

      // For shortlisted updates, filter to only include those where user is shortlisted
      const filteredUpdates = await Promise.all(updates.map(async (update) => {
        if (update.visibility === 'shortlisted' && update.targetFormId) {
          try {
            // Check if user is shortlisted in this form
            const isShortlisted = await db.collection('formResponses').findOne({
              formId: new ObjectId(update.targetFormId),
              userId: new ObjectId(session.user.id),
              shortlisted: true
            });
            
            return isShortlisted ? update : null;
          } catch (error) {
            console.error('Error checking shortlist status:', error);
            return null;
          }
        }
        return update;
      }));

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
        ...filteredUpdates.filter((u): u is NonNullable<typeof u> => Boolean(u)).map(update => ({
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
          eventTitle: update.event && update.event[0] ? update.event[0].title : "Event",
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
            {
              $lookup: {
                from: 'events',
                let: { eventId: { $toObjectId: '$eventId' } },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$eventId'] } } }
                ],
                as: 'event'
              }
            },
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
          eventTitle: update.event && update.event[0] ? update.event[0].title : "Event",
        }))
      ];
    }

    // Sort by creation date
    feedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const paginatedItems = feedItems.slice(skip, skip + limit);
    const hasMore = feedItems.length > skip + limit;
    
    const response = {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: feedItems.length,
        hasMore,
      },
    };

    // Cache the result (1 minute TTL for feed)
    apiCache.set(cacheKey, response, CACHE_TTL.SHORT);

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error: any) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}