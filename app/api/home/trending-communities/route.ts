import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get trending communities (by member count, follower count, and recent activity)
    const trendingCommunities = await db.collection('communities')
      .aggregate([
        {
          $match: {
            $or: [
              { status: 'approved' },
              { status: { $exists: false } }
            ],
            status: { $ne: 'rejected' }
          }
        },
        {
          $addFields: {
            membersCount: { $size: '$members' },
            // Calculate a score based on members, followers, and recent events
            score: {
              $add: [
                { $size: '$members' },
                { $multiply: [{ $ifNull: ['$followersCount', 0] }, 0.5] },
                { $multiply: [{ $size: { $ifNull: ['$events', []] } }, 0.3] }
              ]
            }
          }
        },
        // If user is logged in, check their relationship with each community
        ...(session?.user?.id ? [
          {
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
                }
              ],
              as: 'userFollows'
            }
          },
          {
            $addFields: {
              userRelation: {
                $cond: {
                  if: { $in: [session.user.id, '$admins'] },
                  then: 'admin',
                  else: {
                    $cond: {
                      if: { $in: [session.user.id, '$members'] },
                      then: 'member',
                      else: {
                        $cond: {
                          if: { $gt: [{ $size: '$userFollows' }, 0] },
                          then: 'follower',
                          else: 'none'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ] : []),
        {
          $project: {
            _id: 1,
            name: 1,
            handle: 1,
            description: 1,
            avatar: 1,
            membersCount: 1,
            isVerified: 1,
            userRelation: 1
          }
        },
        { $sort: { score: -1 } },
        { $limit: 6 }
      ])
      .toArray();

    return NextResponse.json(trendingCommunities);
  } catch (error: any) {
    console.error('Error fetching trending communities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending communities' },
      { status: 500 }
    );
  }
}