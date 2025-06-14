import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions } from '@/lib/admin-auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(adminAuthOptions);
    
    // Check if the user is an admin
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get all pending communities
    const pendingCommunities = await db.collection('communities')
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .toArray();

    // Transform the data for the frontend
    const transformedCommunities = pendingCommunities.map(community => ({
      id: community._id.toString(),
      name: community.name,
      handle: community.handle,
      description: community.description,
      avatar: community.avatar,
      banner: community.banner,
      creatorId: community.creatorId || community.admins[0],
      createdAt: community.createdAt,
      status: community.status,
    }));

    return NextResponse.json(transformedCommunities);
  } catch (error: any) {
    console.error('Error fetching pending communities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending communities' },
      { status: 500 }
    );
  }
}