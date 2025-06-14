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

    // Get community stats
    const [
      totalCommunities,
      pendingCommunities,
      approvedCommunities,
      rejectedCommunities,
      recentCommunities
    ] = await Promise.all([
      db.collection('communities').countDocuments({}),
      db.collection('communities').countDocuments({ status: 'pending' }),
      db.collection('communities').countDocuments({ status: 'approved' }),
      db.collection('communities').countDocuments({ status: 'rejected' }),
      db.collection('communities')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .project({
          _id: 1,
          name: 1,
          handle: 1,
          status: 1,
          createdAt: 1
        })
        .toArray()
    ]);

    return NextResponse.json({
      totalCommunities,
      pendingCommunities,
      approvedCommunities,
      rejectedCommunities,
      recentCommunities: recentCommunities.map(community => ({
        id: community._id.toString(),
        name: community.name,
        handle: community.handle,
        status: community.status || 'approved', // Default for older communities
        createdAt: community.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch community stats' },
      { status: 500 }
    );
  }
}