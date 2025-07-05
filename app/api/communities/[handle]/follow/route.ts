import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is already following
    const userFollows = await db.collection('follows').findOne({
      userId: session.user.id,
      communityId: community._id.toString()
    });

    if (userFollows) {
      // Unfollow
      await db.collection('follows').deleteOne({
        userId: session.user.id,
        communityId: community._id.toString()
      });
      await db.collection('communities').updateOne(
        { _id: community._id },
        { $inc: { followersCount: -1 } }
      );
      return NextResponse.json({ following: false });
    } else {
      // Follow
      await db.collection('follows').insertOne({
        userId: session.user.id,
        communityId: community._id.toString(),
        createdAt: new Date()
      });
      await db.collection('communities').updateOne(
        { _id: community._id },
        { $inc: { followersCount: 1 } }
      );
      return NextResponse.json({ following: true });
    }
  } catch (error: any) {
    console.error('Error following/unfollowing community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to follow/unfollow community' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ following: false });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const userFollows = await db.collection('follows').findOne({
      userId: session.user.id,
      communityId: community._id.toString()
    });

    return NextResponse.json({ following: !!userFollows });
  } catch (error: any) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check follow status' },
      { status: 500 }
    );
  }
}