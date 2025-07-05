import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Mark all notifications as read
    const result = await db.collection('notifications').updateMany(
      { 
        userId: session.user.id,
        read: { $ne: true }
      },
      {
        $set: {
          read: true,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      count: result.modifiedCount
    });
  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}