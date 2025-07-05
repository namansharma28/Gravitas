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

    // Get communities where user is admin or member
    const communities = await db.collection('communities')
      .aggregate([
        {
          $match: {
            $or: [
              { admins: session.user.id },
              { members: session.user.id },
              // Include rejected communities only for their creators
              {
                $and: [
                  { status: 'rejected' },
                  { creatorId: session.user.id }
                ]
              }
            ]
          }
        },
        {
          $addFields: {
            membersCount: { $size: '$members' },
            userRole: {
              $cond: {
                if: { $in: [session.user.id, '$admins'] },
                then: 'admin',
                else: 'member'
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
            membersCount: 1,
            isVerified: 1,
            userRole: 1
          }
        },
        { $sort: { userRole: 1, name: 1 } } // Admins first, then alphabetical
      ])
      .toArray();

    return NextResponse.json(communities);
  } catch (error: any) {
    console.error('Error fetching user communities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user communities' },
      { status: 500 }
    );
  }
}