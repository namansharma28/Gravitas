import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Store a new push subscription
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await request.json();
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Store the subscription in the database
    await db.collection('pushSubscriptions').updateOne(
      { 
        userId: new ObjectId(session.user.id),
        endpoint: subscription.endpoint 
      },
      { 
        $set: {
          subscription,
          updatedAt: new Date()
        },
        $setOnInsert: {
          userId: new ObjectId(session.user.id),
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error storing push subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to store subscription' },
      { status: 500 }
    );
  }
}

// Delete a push subscription
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Remove the subscription from the database
    await db.collection('pushSubscriptions').deleteOne({
      userId: new ObjectId(session.user.id),
      'subscription.endpoint': endpoint
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}