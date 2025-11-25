import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { apiCache, CACHE_TTL, generateCacheKey } from '@/lib/cache';
import { trackDBQuery } from '@/lib/performance';

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'anonymous';
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Generate cache key based on user ID and pagination
    const cacheKey = generateCacheKey('explore-communities', { userId, limit, offset });
    
    // Try to get from cache (longer TTL for explore page)
    const cached = apiCache.get(cacheKey);
    if (cached) {
      const responseTime = Date.now() - startTime;
      console.log(`✅ Explore communities cache HIT (${responseTime}ms)`);
      
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time': `${responseTime}ms`,
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      });
    }
    
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get current date for filtering upcoming events
    const currentDate = new Date().toISOString().split('T')[0];

    // Optimized aggregation with better indexing hints
    const communities = await trackDBQuery('explore-communities', async () => {
      return db.collection('communities')
        .aggregate([
          // Filter approved communities first (uses index)
          {
            $match: {
              $or: [
                { status: 'approved' },
                { status: { $exists: false } }
              ],
              status: { $ne: 'rejected' }
            }
          },
          // Add members count efficiently
          {
            $addFields: {
              membersCount: { 
                $cond: {
                  if: { $isArray: '$members' },
                  then: { $size: '$members' },
                  else: 0
                }
              },
              followersCount: { 
                $cond: {
                  if: { $isArray: '$followers' },
                  then: { $size: '$followers' },
                  else: 0
                }
              }
            }
          },
          // Sort early to limit data processed in lookups
          { $sort: { membersCount: -1, followersCount: -1 } },
          // Apply pagination early
          { $skip: offset },
          { $limit: limit },
          // Only lookup events for paginated results
          {
            $lookup: {
              from: 'events',
              let: { communityId: { $toString: '$_id' } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$communityId', '$$communityId'] },
                        { $gte: ['$date', currentDate] }
                      ]
                    }
                  }
                },
                { $limit: 1 }, // Just check if any exist
                { $project: { _id: 1 } }
              ],
              as: 'upcomingEvents'
            }
          },
          {
            $addFields: {
              upcomingEventsCount: { $size: '$upcomingEvents' }
            }
          },
          // Only lookup user follows if authenticated
          ...(session?.user?.id ? [{
            $lookup: {
              from: 'follows',
              let: { communityId: { $toString: '$_id' } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$communityId', '$$communityId'] },
                        { $eq: ['$userId', session.user.id] }
                      ]
                    }
                  }
                },
                { $limit: 1 },
                { $project: { _id: 1 } }
              ],
              as: 'userFollows'
            }
          }] : []),
          // Calculate user relation
          {
            $addFields: {
              userRelation: session?.user?.id ? {
                $cond: {
                  if: { $in: [session.user.id, { $ifNull: ['$admins', []] }] },
                  then: 'admin',
                  else: {
                    $cond: {
                      if: { $in: [session.user.id, { $ifNull: ['$members', []] }] },
                      then: 'member',
                      else: {
                        $cond: {
                          if: { $gt: [{ $size: { $ifNull: ['$userFollows', []] } }, 0] },
                          then: 'follower',
                          else: 'none'
                        }
                      }
                    }
                  }
                }
              } : 'none'
            }
          },
          // Project only needed fields
          {
            $project: {
              name: 1,
              handle: 1,
              description: 1,
              avatar: 1,
              banner: 1,
              location: 1,
              website: 1,
              membersCount: 1,
              followersCount: 1,
              isVerified: 1,
              createdAt: 1,
              userRelation: 1,
              upcomingEventsCount: 1
            }
          }
        ])
        .toArray();
    });

    const responseTime = Date.now() - startTime;
    console.log(`⏱️ Explore communities fetched: ${communities.length} items in ${responseTime}ms`);

    // Cache the result for 10 minutes (longer for explore page)
    apiCache.set(cacheKey, communities, CACHE_TTL.LONG);

    return NextResponse.json(communities, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${responseTime}ms`,
        'X-Total-Count': communities.length.toString(),
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ Error fetching communities (${responseTime}ms):`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}
