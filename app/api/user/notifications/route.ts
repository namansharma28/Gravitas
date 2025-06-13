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

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { notificationSettings: 1 } }
    );

    const defaultSettings = {
      emailNotifications: true,
      eventReminders: true,
      communityUpdates: true,
      newFollowers: false,
      eventInvitations: true,
      weeklyDigest: false,
    };

    return NextResponse.json(user?.notificationSettings || defaultSettings);
  } catch (error: any) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notification settings' },
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

    const settings = await request.json();

    const client = await clientPromise;
    const db = client.db('gravitas');

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          notificationSettings: settings,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}