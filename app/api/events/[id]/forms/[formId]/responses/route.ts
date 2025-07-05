import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
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

    if (!ObjectId.isValid(params.formId) || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid form ID or event ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("gravitas");

    // Verify that the event exists
    const event = await db.collection("events").findOne({
      _id: new ObjectId(params.id),
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get community to check permissions
    const community = await db.collection('communities').findOne({ 
      _id: new ObjectId(event.communityId) 
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user can view responses (admin or member)
    const isAdmin = community.admins.includes(session.user.id);
    const isMember = community.members.includes(session.user.id);

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Not authorized to view responses' }, { status: 403 });
    }

    // Get the form
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

    // Get form responses with user details
    const responses = await db.collection("formResponses")
      .aggregate([
        { 
          $match: { 
            formId: new ObjectId(params.formId),
            eventId: new ObjectId(params.id)
          } 
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        { $sort: { createdAt: -1 } }
      ])
      .toArray();

    // Transform the data
    const transformedResponses = responses.map(response => ({
      id: response._id.toString(),
      formId: response.formId.toString(),
      userId: response.userId.toString(),
      user: {
        name: response.user.name || "Unknown User",
        email: response.user.email || "No email",
      },
      answers: response.answers,
      shortlisted: response.shortlisted || false,
      checkedIn: response.checkedIn || false,
      checkedInAt: response.checkedInAt,
      createdAt: response.createdAt,
    }));

    return NextResponse.json(transformedResponses);
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}