import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get the community
    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Get updates for this community
    const updates = await db.collection('updates')
      .find({ communityId: community._id.toString() })
      .sort({ createdAt: -1 })
      .toArray();

    // Transform the updates for the frontend
    const transformedUpdates = updates.map(update => ({
      id: update._id.toString(),
      content: update.content,
      images: update.images || [],
      createdAt: update.createdAt,
      updatedAt: update.updatedAt,
      author: {
        id: update.authorId,
        name: update.authorName,
        image: update.authorImage
      }
    }));

    return NextResponse.json(transformedUpdates);
  } catch (error: any) {
    console.error('Error fetching community updates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch updates' },
      { status: 500 }
    );
  }
} 