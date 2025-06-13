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