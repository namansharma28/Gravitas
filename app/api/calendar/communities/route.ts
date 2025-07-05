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

    // Get user's communities (member and admin)
    const userCommunities = await db.collection('communities')
      .find({
        $or: [
          { members: session.user.id },
          { admins: session.user.id }
        ]
      })
      .project({
        _id: 1,
        name: 1,
        handle: 1,
        avatar: 1,
      })
      .toArray();

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
                $project: {
                  _id: 1,
                  name: 1,
                  handle: 1,
                  avatar: 1,
                }
              }
            ],
            as: 'community'
          }
        },
        { $unwind: '$community' },
        { $replaceRoot: { newRoot: '$community' } }
      ])
      .toArray();

    // Combine and deduplicate communities
    const allCommunities = [...userCommunities, ...followedCommunities];
    const uniqueCommunities = allCommunities.filter((community, index, self) =>
      index === self.findIndex(c => c._id.toString() === community._id.toString())
    );

    // Transform for response
    const communities = uniqueCommunities.map(community => ({
      id: community._id.toString(),
      name: community.name,
      handle: community.handle,
      avatar: community.avatar,
    }));

    return NextResponse.json(communities);
  } catch (error: any) {
    console.error('Error fetching user communities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}