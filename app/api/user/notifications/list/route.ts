import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get user's notifications
    const notifications = await db.collection('notifications')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // Transform notifications for the frontend
    const transformedNotifications = notifications.map(notification => ({
      id: notification._id.toString(),
      title: notification.title,
      description: notification.description,
      createdAt: notification.createdAt,
      read: notification.read || false,
      type: notification.type || 'system',
      linkUrl: notification.linkUrl,
    }));

    return NextResponse.json(transformedNotifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}