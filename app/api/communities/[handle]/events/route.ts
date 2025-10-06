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
    const { title, description, date, endDate, time, location, capacity, image, isMultiDay } = data;

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
    const eventData: any = {
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
      registrationEnabled: false,
      registrationType: null,
      rsvpFormId: null,
      createdAt: new Date(),
    };

    // Add multi-day fields if applicable
    if (isMultiDay && endDate) {
      eventData.isMultiDay = true;
      eventData.endDate = endDate;
    }

    const event = await db.collection('events').insertOne(eventData);

    // Update community with new event
    await db.collection('communities').updateOne(
      { _id: community._id },
      { $push: { events: event.insertedId } } as any
    );

    // Send notification to community members about new event
    try {
      const communityMembers = community.members || [];
      const notifications = communityMembers
        .filter((memberId: string) => memberId !== session.user.id) // Don't notify the creator
        .map((memberId: string) => ({
          userId: memberId,
          type: 'event_created',
          title: `New Event: ${title}`,
          description: `${community.name} created a new event "${title}" on ${date} at ${time}`,
          linkUrl: `/events/${event.insertedId}`,
          eventId: event.insertedId,
          communityId: community._id,
          senderId: session.user.id,
          read: false,
          createdAt: new Date(),
        }));

      if (notifications.length > 0) {
        await db.collection('notifications').insertMany(notifications);
      }
    } catch (notificationError) {
      console.error('Error sending event creation notifications:', notificationError);
      // Don't fail the event creation if notifications fail
    }

    return NextResponse.json({
      id: event.insertedId,
      title,
      description,
      date,
      endDate: isMultiDay ? endDate : undefined,
      time,
      location,
      capacity,
      image,
      isMultiDay: !!isMultiDay,
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
    // Allow non-logged-in users to fetch events
    const userId = session?.user?.id;

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
      endDate: event.endDate,
      time: event.time,
      location: event.location,
      capacity: event.capacity,
      image: event.image,
      isMultiDay: event.isMultiDay || false,
      attendees: event.attendees || [],
      interested: event.interested || [],
      community: {
        id: community._id.toString(),
        name: community.name,
        handle: community.handle,
        avatar: community.avatar || ''
      },
      attendeesCount: (event.attendees || []).length
    })));
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}