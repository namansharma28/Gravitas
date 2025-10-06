import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get notifications for the user
    const notifications = await db.collection('notifications')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(notifications.map(notification => ({
      id: notification._id.toString(),
      title: notification.title,
      description: notification.description,
      type: notification.type,
      read: notification.read || false,
      createdAt: notification.createdAt,
      linkUrl: notification.linkUrl,
    })));
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, markAllAsRead } = await request.json();
    const client = await clientPromise;
    const db = client.db('gravitas');

    if (markAllAsRead) {
      // Mark all notifications as read for the user
      await db.collection('notifications').updateMany(
        { userId: session.user.id },
        { $set: { read: true, readAt: new Date() } }
      );
    } else if (notificationId) {
      // Mark specific notification as read
      await db.collection('notifications').updateOne(
        { _id: new ObjectId(notificationId), userId: session.user.id },
        { $set: { read: true, readAt: new Date() } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notifications' },
      { status: 500 }
    );
  }
}