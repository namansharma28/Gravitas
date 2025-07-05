import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get user profile with stats
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate stats
    const [
      communitiesOwned,
      communitiesJoined,
      eventsCreated,
      eventsAttended,
      followersCount,
      followingCount
    ] = await Promise.all([
      db.collection('communities').countDocuments({ admins: session.user.id }),
      db.collection('communities').countDocuments({ 
        members: session.user.id,
        admins: { $ne: session.user.id }
      }),
      db.collection('events').countDocuments({ creatorId: session.user.id }),
      db.collection('eventRegistrations').countDocuments({ userId: new ObjectId(session.user.id) }),
      db.collection('follows').countDocuments({ communityId: session.user.id }), // If users can follow users
      db.collection('follows').countDocuments({ userId: session.user.id })
    ]);

    const userProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      location: user.location,
      website: user.website,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      stats: {
        communitiesOwned,
        communitiesJoined,
        eventsCreated,
        eventsAttended,
        followersCount,
        followingCount
      }
    };

    return NextResponse.json(userProfile);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, bio, location, website, image } = data;

    const client = await clientPromise;
    const db = client.db('gravitas');

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          name,
          bio,
          location,
          website,
          image,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user profile' },
      { status: 500 }
    );
  }
}