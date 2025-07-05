import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Create a test notification
    const notification = {
      userId: session.user.id,
      title: "Test Notification",
      description: "This is a test notification from Gravitas",
      type: "system",
      read: false,
      createdAt: new Date(),
    };

    await db.collection('notifications').insertOne(notification);

    return NextResponse.json({
      success: true,
      message: 'Test notification created',
    });
  } catch (error: any) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test notification' },
      { status: 500 }
    );
  }
}