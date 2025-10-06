import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: { id: string; formId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { answers } = await request.json();

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(params.formId) || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid form ID or event ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("gravitas");

    // Verify that the form exists and belongs to the event
    const form = await db.collection("forms").findOne({
      _id: new ObjectId(params.formId),
      eventId: params.id,
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // Check if user already submitted this form
    const existingResponse = await db.collection("formResponses").findOne({
      formId: new ObjectId(params.formId),
      userId: new ObjectId(session.user.id),
    });

    if (existingResponse) {
      return NextResponse.json(
        { error: "You have already submitted this form" },
        { status: 400 }
      );
    }

    // Create the form response
    const response = await db.collection("formResponses").insertOne({
      formId: new ObjectId(params.formId),
      eventId: new ObjectId(params.id),
      userId: new ObjectId(session.user.id),
      answers,
      shortlisted: false,
      checkedIn: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // If this is an RSVP form, also create an event registration
    if (form.isRSVPForm) {
      // Check if user already registered for the event
      const existingRegistration = await db.collection('eventRegistrations').findOne({
        eventId: new ObjectId(params.id),
        userId: new ObjectId(session.user.id),
      });

      if (!existingRegistration) {
        await db.collection('eventRegistrations').insertOne({
          eventId: new ObjectId(params.id),
          userId: new ObjectId(session.user.id),
          userName: session.user.name,
          userEmail: session.user.email,
          registrationType: 'form',
          formResponseId: response.insertedId,
          createdAt: new Date(),
        });
      }
    }

    // Send notification to event organizers about new form response
    try {
      const event = await db.collection('events').findOne({ _id: new ObjectId(params.id) });
      if (event) {
        const community = await db.collection('communities').findOne({ 
          _id: new ObjectId(event.communityId) 
        });
        
        if (community) {
          const organizers = [event.creatorId, ...community.admins];
          const uniqueOrganizers = Array.from(new Set(organizers)).filter(id => id !== session.user.id);
          
          const notificationType = form.isRSVPForm ? 'rsvp_confirmed' : 'form_response';
          const title = form.isRSVPForm 
            ? `New RSVP: ${event.title}`
            : `New Form Response: ${form.title}`;
          const description = form.isRSVPForm
            ? `${session.user.name} confirmed their attendance for ${event.title}`
            : `${session.user.name} submitted a response to "${form.title}" for ${event.title}`;
          
          const notifications = uniqueOrganizers.map((organizerId: string) => ({
            userId: organizerId,
            type: notificationType,
            title,
            description,
            linkUrl: `/events/${params.id}`,
            eventId: new ObjectId(params.id),
            senderId: session.user.id,
            read: false,
            createdAt: new Date(),
          }));

          if (notifications.length > 0) {
            await db.collection('notifications').insertMany(notifications);
          }
        }
      }
    } catch (notificationError) {
      console.error('Error sending form response notifications:', notificationError);
      // Don't fail the form submission if notifications fail
    }

    return NextResponse.json({
      id: response.insertedId,
      message: form.isRSVPForm ? "Successfully registered for the event!" : "Form submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}