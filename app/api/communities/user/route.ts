import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    const communities = await db.collection('communities')
      .find({ admins: session.user.id })
      .project({
        name: 1,
        handle: 1,
        avatar: 1,
        description: 1,
        members: 1,
        isVerified: 1
      })
      .toArray();

    return NextResponse.json(communities);
  } catch (error: any) {
    console.error('Error fetching user communities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch communities' },
      { status: 500 }
    );
  }
} 