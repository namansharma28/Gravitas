import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('gravitas');

    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // If community is pending, only show to admins or the creator
    if (community.status === 'pending') {
      const session = await getServerSession(authOptions);
      const isCreator = session?.user?.id === community.creatorId;
      const isAdmin = community.admins.includes(session?.user?.id);
      
      if (!isCreator && !isAdmin) {
        return NextResponse.json({ error: 'Community not found' }, { status: 404 });
      }
    }

    return NextResponse.json({
      id: community._id.toString(),
      name: community.name,
      handle: community.handle,
      description: community.description,
      banner: community.banner,
      avatar: community.avatar,
      website: community.website,
      location: community.location,
      members: community.members,
      admins: community.admins,
      events: community.events,
      updates: community.updates,
      followersCount: community.followersCount,
      isVerified: community.isVerified,
      status: community.status || 'approved', // Default for backward compatibility
      createdAt: community.createdAt
    });
  } catch (error: any) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch community' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, banner, avatar, website, location } = data;

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get community and check permissions
    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    if (!community.admins.includes(session.user.id)) {
      return NextResponse.json({ error: 'Not authorized to edit community' }, { status: 403 });
    }

    // Update community
    await db.collection('communities').updateOne(
      { handle: params.handle },
      {
        $set: {
          name,
          description,
          banner,
          avatar,
          website,
          location,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      handle: params.handle,
      name,
      description,
      banner,
      avatar,
      website,
      location,
    });
  } catch (error: any) {
    console.error('Error updating community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update community' },
      { status: 500 }
    );
  }
}