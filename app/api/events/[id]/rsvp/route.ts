import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Generate a simple UUID alternative
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { action, registrationType } = data;

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get event
    const event = await db.collection('events').findOne({ _id: new ObjectId(params.id) });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get community to check permissions
    const community = await db.collection('communities').findOne({ 
      _id: new ObjectId(event.communityId) 
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const isMember = community.members.includes(session.user.id);
    const isAdmin = community.admins.includes(session.user.id);

    if (action === 'start') {
      // Only members and admins can start registration
      if (!isMember && !isAdmin) {
        return NextResponse.json({ error: 'Not authorized to start registration' }, { status: 403 });
      }

      if (registrationType === 'direct') {
        // Create automatic registration form
        const form = await db.collection('forms').insertOne({
          title: 'Event Registration',
          description: 'Register for this event',
          fields: [
            {
              id: generateId(),
              label: 'Name',
              type: 'text',
              required: true,
              options: []
            },
            {
              id: generateId(),
              label: 'Email',
              type: 'email',
              required: true,
              options: []
            }
          ],
          eventId: params.id,
          createdBy: session.user.id,
          isRSVPForm: true,
          isDirectRegistration: true,
          responses: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Update event with registration info
        await db.collection('events').updateOne(
          { _id: new ObjectId(params.id) },
          {
            $set: {
              registrationEnabled: true,
              registrationType: 'direct',
              rsvpFormId: form.insertedId.toString(),
              updatedAt: new Date(),
            },
          }
        );

        return NextResponse.json({
          success: true,
          registrationType: 'direct',
          formId: form.insertedId.toString(),
        });
      } else if (registrationType === 'form') {
        // Update event to enable form-based registration
        await db.collection('events').updateOne(
          { _id: new ObjectId(params.id) },
          {
            $set: {
              registrationEnabled: true,
              registrationType: 'form',
              updatedAt: new Date(),
            },
          }
        );

        return NextResponse.json({
          success: true,
          registrationType: 'form',
          redirectTo: `/events/${params.id}/forms/create?rsvp=true`,
        });
      }
    } else if (action === 'stop') {
      // Only members and admins can stop registration
      if (!isMember && !isAdmin) {
        return NextResponse.json({ error: 'Not authorized to stop registration' }, { status: 403 });
      }

      // Update event to disable registration
      await db.collection('events').updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            registrationEnabled: false,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Registration has been stopped',
      });
    } else if (action === 'register') {
      // User registration
      if (!event.registrationEnabled) {
        return NextResponse.json({ error: 'Registration is not enabled for this event' }, { status: 400 });
      }

      // Check if user already registered
      const existingRegistration = await db.collection('eventRegistrations').findOne({
        eventId: new ObjectId(params.id),
        userId: new ObjectId(session.user.id),
      });

      if (existingRegistration) {
        return NextResponse.json({ error: 'You are already registered for this event' }, { status: 400 });
      }

      if (event.registrationType === 'direct') {
        // Direct registration - automatically register user
        const registration = await db.collection('eventRegistrations').insertOne({
          eventId: new ObjectId(params.id),
          userId: new ObjectId(session.user.id),
          userName: session.user.name,
          userEmail: session.user.email,
          registrationType: 'direct',
          createdAt: new Date(),
        });

        // Also add to form responses for consistency
        if (event.rsvpFormId) {
          await db.collection('formResponses').insertOne({
            formId: new ObjectId(event.rsvpFormId),
            eventId: new ObjectId(params.id),
            userId: new ObjectId(session.user.id),
            answers: [
              { fieldId: 'name', value: session.user.name || '' },
              { fieldId: 'email', value: session.user.email || '' }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully registered for the event',
          registrationId: registration.insertedId,
        });
      } else {
        return NextResponse.json({ 
          error: 'Form-based registration requires filling out the registration form',
          redirectTo: `/events/${params.id}/forms/${event.rsvpFormId}/submit`
        }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling RSVP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to handle RSVP' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Allow non-logged-in users to fetch RSVP status
    
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get event
    const event = await db.collection('events').findOne({ _id: new ObjectId(params.id) });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    let userRegistration = null;
    if (session?.user?.id) {
      userRegistration = await db.collection('eventRegistrations').findOne({
        eventId: new ObjectId(params.id),
        userId: new ObjectId(session.user.id),
      });
    }

    // Get registration count
    const registrationCount = await db.collection('eventRegistrations').countDocuments({
      eventId: new ObjectId(params.id),
    });

    return NextResponse.json({
      registrationEnabled: event.registrationEnabled || false,
      registrationType: event.registrationType || null,
      rsvpFormId: event.rsvpFormId || null,
      userRegistered: !!userRegistration,
      registrationCount,
      capacity: event.capacity,
    });
  } catch (error: any) {
    console.error('Error fetching RSVP status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch RSVP status' },
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
    const { action, formId } = data;

    const client = await clientPromise;
    const db = client.db('gravitas');

    if (action === 'setRSVPForm') {
      // Update event with RSVP form ID
      await db.collection('events').updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            registrationEnabled: true,
            registrationType: 'form',
            rsvpFormId: formId,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating RSVP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update RSVP' },
      { status: 500 }
    );
  }
}