import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verify } from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const headersList = headers();
    const authHeader = headersList.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verify(token, process.env.ADMIN_JWT_SECRET || 'admin-secret-key');
      if (!decoded || (decoded as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (error) {
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
  } catch (error) {
    console.error('Error fetching pending communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending communities' },
      { status: 500 }
    );
  }
}