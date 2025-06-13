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
      .aggregate([
        { $match: { userId: session.user.id } },
        {
          $lookup: {
            from: 'communities',
            let: { communityId: { $toObjectId: '$communityId' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$communityId'] } } },
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
              }
            ],
            as: 'community'
          }
        },
        { $unwind: '$community' },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                '$community',
                { followedAt: '$createdAt' }
              ]
            }
          }
        },
        { $sort: { followedAt: -1 } }
      ])
      .toArray();

    return NextResponse.json(followedCommunities);
  } catch (error: any) {
    console.error('Error fetching followed communities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch followed communities' },
      { status: 500 }
    );
  }
}