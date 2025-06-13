import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Mark notification as read
    const result = await db.collection('notifications').updateOne(
      { 
        _id: new ObjectId(params.id),
        userId: session.user.id
      },
      {
        $set: {
          read: true,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      id: params.id
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}