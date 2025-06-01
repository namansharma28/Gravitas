import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, date, time, location, capacity, image } = data;

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get community
    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is member or admin
    if (!community.members.includes(session.user.id) && !community.admins.includes(session.user.id)) {
      return NextResponse.json({ error: 'Not authorized to create events' }, { status: 403 });
    }

    // Create event
    const event = await db.collection('events').insertOne({
      title,
      description,
      date,
      time,
      location,
      capacity,
      image,
      communityId: community._id.toString(),
      creatorId: session.user.id,
      attendees: [],
      interested: [],
      createdAt: new Date(),
    });

    // Update community with new event
    await db.collection('communities').updateOne(
      { _id: community._id },
      { $push: { events: event.insertedId } } as any
    );

    return NextResponse.json({
      id: event.insertedId,
      title,
      description,
      date,
      time,
      location,
      capacity,
      image,
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get community
    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Get events
    const events = await db.collection('events')
      .find({ communityId: community._id.toString() })
      .sort({ date: 1, time: 1 })
      .toArray();

    return NextResponse.json(events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: event.capacity,
      image: event.image,
      attendees: event.attendees || [],
      interested: event.interested || [],
    })));
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}