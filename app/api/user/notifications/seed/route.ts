import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

// This is a development-only endpoint to seed notifications for testing
export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Sample notifications
    const sampleNotifications = [
      {
        userId: session.user.id,
        title: 'New event in Tech Enthusiasts',
        description: 'Web Development Workshop has been scheduled for tomorrow',
        type: 'event',
        linkUrl: '/events/123',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        userId: session.user.id,
        title: 'Registration confirmed',
        description: 'Your registration for AI Conference has been confirmed',
        type: 'event',
        linkUrl: '/events/456',
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: session.user.id,
        title: 'Community update',
        description: 'Design Community posted a new update about the upcoming meetup',
        type: 'community',
        linkUrl: '/communities/design-community',
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        userId: session.user.id,
        title: 'Welcome to Gravitas!',
        description: 'Thanks for joining. Discover communities and events that match your interests.',
        type: 'system',
        read: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ];

    // Clear existing notifications for this user
    await db.collection('notifications').deleteMany({ userId: session.user.id });

    // Insert sample notifications
    await db.collection('notifications').insertMany(sampleNotifications);

    return NextResponse.json({
      success: true,
      message: 'Sample notifications created',
      count: sampleNotifications.length
    });
  } catch (error: any) {
    console.error('Error seeding notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed notifications' },
      { status: 500 }
    );
  }
}