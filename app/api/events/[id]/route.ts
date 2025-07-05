import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get event
    const event = await db.collection('events').findOne({ _id: new ObjectId(params.id) });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get community details
    const community = await db.collection('communities').findOne({ _id: new ObjectId(event.communityId) });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is a member or admin of the community
    const isMember = community.members.includes(session.user.id);
    const isAdmin = community.admins.includes(session.user.id);

    return NextResponse.json({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: event.capacity,
      image: event.image,
      creatorId: event.creatorId,
      community: {
        id: community._id.toString(),
        name: community.name,
        handle: community.handle,
        avatar: community.avatar,
      },
      attendees: event.attendees || [],
      interested: event.interested || [],
      userPermissions: {
        isMember,
        isAdmin,
        isCreator: event.creatorId === session.user.id,
        canEdit: isAdmin || event.creatorId === session.user.id,
        canDelete: isAdmin || event.creatorId === session.user.id,
        canCreateForms: isMember || isAdmin,
        canCreateUpdates: isMember || isAdmin,
      }
    });
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
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

    // Get event
    const event = await db.collection('events').findOne({ _id: new ObjectId(params.id) });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get community to check permissions
    const community = await db.collection('communities').findOne({ _id: new ObjectId(event.communityId) });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user can edit (admin or creator)
    const isAdmin = community.admins.includes(session.user.id);
    const isCreator = event.creatorId === session.user.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: 'Not authorized to edit this event' }, { status: 403 });
    }

    // Update event
    await db.collection('events').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          title,
          description,
          date,
          time,
          location,
          capacity,
          image,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      id: params.id,
      title,
      description,
      date,
      time,
      location,
      capacity,
      image,
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get event
    const event = await db.collection('events').findOne({ _id: new ObjectId(params.id) });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get community to check permissions
    const community = await db.collection('communities').findOne({ _id: new ObjectId(event.communityId) });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user can delete (admin or creator)
    const isAdmin = community.admins.includes(session.user.id);
    const isCreator = event.creatorId === session.user.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: 'Not authorized to delete this event' }, { status: 403 });
    }

    // Delete related forms and form responses
    await db.collection('formResponses').deleteMany({ eventId: new ObjectId(params.id) });
    await db.collection('forms').deleteMany({ eventId: params.id });

    // Delete event
    await db.collection('events').deleteOne({ _id: new ObjectId(params.id) });

    // Remove event from community's events array
    await db.collection('communities').updateOne(
      { _id: new ObjectId(event.communityId) },
      { $pull: { events: params.id } } as any
    );

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}