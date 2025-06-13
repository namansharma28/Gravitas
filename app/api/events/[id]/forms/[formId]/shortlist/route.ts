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

    const { responseIds, action } = await request.json();

    if (!Array.isArray(responseIds) || !action) {
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

    // Verify that the event exists and user has permission
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

    // Check if user can manage participants (admin or member)
    const isAdmin = community.admins.includes(session.user.id);
    const isMember = community.members.includes(session.user.id);

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Not authorized to manage participants' }, { status: 403 });
    }

    // Update shortlist status for selected responses
    const shortlisted = action === 'shortlist';
    
    const result = await db.collection("formResponses").updateMany(
      {
        _id: { $in: responseIds.map(id => new ObjectId(id)) },
        formId: new ObjectId(params.formId),
        eventId: new ObjectId(params.id),
      },
      {
        $set: {
          shortlisted,
          shortlistedAt: shortlisted ? new Date() : null,
          shortlistedBy: shortlisted ? new ObjectId(session.user.id) : null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "No responses found to update" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} participant(s) ${shortlisted ? 'shortlisted' : 'removed from shortlist'}`,
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating shortlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}