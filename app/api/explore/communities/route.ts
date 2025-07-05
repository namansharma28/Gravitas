import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get all communities with additional data, filtering out pending and rejected communities
    const communities = await db.collection('communities')
      .aggregate([
        {
          $match: {
            $or: [
              { status: 'approved' },
              { status: { $exists: false } } // For backward compatibility with existing communities
            ],
            status: { $ne: 'rejected' } // Explicitly exclude rejected communities
          }
        },
        {
          $addFields: {
            membersCount: { $size: '$members' },
            upcomingEventsCount: {
              $size: {
                $filter: {
                  input: '$events',
                  cond: { $gte: ['$$this.date', new Date().toISOString().split('T')[0]] }
                }
              }
            }
          }
        },
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
                      { $eq: ['$userId', session?.user?.id || ''] }
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
                if: { $in: [session?.user?.id || '', '$admins'] },
                then: 'admin',
                else: {
                  $cond: {
                    if: { $in: [session?.user?.id || '', '$members'] },
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
        },
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
            upcomingEventsCount: 1,
            status: 1
          }
        },
        { $sort: { membersCount: -1, followersCount: -1 } }
      ])
      .toArray();

    return NextResponse.json(communities);
  } catch (error: any) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}