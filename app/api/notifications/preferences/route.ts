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

    // Get user's notification preferences
    const preferences = await db.collection('notificationPreferences').findOne({ 
      userId: session.user.id 
    });

    // Default preferences if none exist
    const defaultPreferences = {
      eventCreated: true,
      eventUpdated: true,
      eventReminder: true,
      eventCancelled: true,
      communityPost: true,
      communityUpdate: true,
      communityJoined: true,
      formResponse: true,
      rsvpConfirmed: true,
      browserNotifications: true,
    };

    return NextResponse.json(preferences?.preferences || defaultPreferences);
  } catch (error: any) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await request.json();
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Upsert user's notification preferences
    await db.collection('notificationPreferences').updateOne(
      { userId: session.user.id },
      {
        $set: {
          userId: session.user.id,
          preferences,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, preferences });
  } catch (error: any) {
    console.error('Error saving notification preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save preferences' },
      { status: 500 }
    );
  }
}