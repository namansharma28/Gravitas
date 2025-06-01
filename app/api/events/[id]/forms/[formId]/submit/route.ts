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

    const client = await clientPromise;
    const db = client.db("gravitas");

    // Verify that the form exists and belongs to the event
    const form = await db.collection("forms").findOne({
      _id: new ObjectId(params.formId),
      eventId: new ObjectId(params.id),
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
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

    return NextResponse.json({
      id: response.insertedId,
      message: "Form submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 