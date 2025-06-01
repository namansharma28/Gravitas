import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const session = await getServerSession();
    const client = await clientPromise;
    const db = client.db('gravitas');

    const community = await db.collection('communities').findOne(
      { handle: params.handle },
      {
        projection: {
          _id: 0,
          id: { $toString: '$_id' },
          name: 1,
          handle: 1,
          description: 1,
          banner: 1,
          avatar: 1,
          website: 1,
          location: 1,
          members: 1,
          admins: 1,
          isVerified: 1,
          createdAt: 1
        }
      }
    );

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(community);
  } catch (error: any) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch community' },
      { status: 500 }
    );
  }
} 