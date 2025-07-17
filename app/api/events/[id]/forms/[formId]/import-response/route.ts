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

    const { answers, email, name } = await request.json();

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

    // Get community to check permissions
    const event = await db.collection("events").findOne({
      _id: new ObjectId(params.id),
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const community = await db.collection('communities').findOne({ 
      _id: new ObjectId(event.communityId) 
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user can import responses (admin or member)
    const isAdmin = community.admins.includes(session.user.id);
    const isMember = community.members.includes(session.user.id);

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Not authorized to import responses' }, { status: 403 });
    }

    // Find or create user based on email
    let userId = new ObjectId(session.user.id); // Default to current user
    
    if (email) {
      // Try to find user by email
      const user = await db.collection("users").findOne({ email: email.toLowerCase() });
      
      if (user) {
        userId = user._id;
      } else {
        // Create a placeholder user record if needed
        // This is optional and depends on your application's requirements
        // For now, we'll just use the current user's ID
      }
    }

    // Create the form response
    const response = await db.collection("formResponses").insertOne({
      formId: new ObjectId(params.formId),
      eventId: new ObjectId(params.id),
      userId: userId,
      answers,
      importedBy: new ObjectId(session.user.id),
      importedAt: new Date(),
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
        userId: userId,
      });

      if (!existingRegistration) {
        await db.collection('eventRegistrations').insertOne({
          eventId: new ObjectId(params.id),
          userId: userId,
          userName: name || "Imported User",
          userEmail: email || "No email provided",
          registrationType: 'imported',
          formResponseId: response.insertedId,
          importedBy: new ObjectId(session.user.id),
          createdAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      id: response.insertedId,
      message: "Response imported successfully",
    });
  } catch (error) {
    console.error("Error importing form response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}