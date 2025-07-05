import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { qrData } = await request.json();

    if (!qrData || !qrData.participantId || !qrData.checkInCode) {
      return NextResponse.json(
        { error: "Invalid QR code data" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
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

    // Check if user can scan tickets (admin, member, or volunteer)
    const isAdmin = community.admins.includes(session.user.id);
    const isMember = community.members.includes(session.user.id);

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Not authorized to scan tickets' }, { status: 403 });
    }

    // Verify the participant exists in form responses
    const formResponse = await db.collection("formResponses").findOne({
      _id: new ObjectId(qrData.participantId),
      eventId: new ObjectId(params.id),
    });

    if (!formResponse) {
      return NextResponse.json({
        valid: false,
        error: "Participant not found for this event",
      });
    }

    // Check if already checked in
    const existingCheckIn = await db.collection("checkIns").findOne({
      eventId: new ObjectId(params.id),
      participantId: new ObjectId(qrData.participantId),
    });

    if (existingCheckIn) {
      return NextResponse.json({
        valid: true,
        alreadyCheckedIn: true,
        checkedInAt: existingCheckIn.checkedInAt,
        checkedInBy: existingCheckIn.checkedInBy,
      });
    }

    // Create check-in record
    const checkIn = await db.collection("checkIns").insertOne({
      eventId: new ObjectId(params.id),
      participantId: new ObjectId(qrData.participantId),
      participantName: qrData.name,
      participantEmail: qrData.email,
      checkInCode: qrData.checkInCode,
      checkedInBy: new ObjectId(session.user.id),
      checkedInAt: new Date(),
      qrData: qrData,
    });

    return NextResponse.json({
      valid: true,
      alreadyCheckedIn: false,
      checkInId: checkIn.insertedId,
      checkedInAt: new Date(),
      message: "Successfully checked in",
    });
  } catch (error) {
    console.error("Error processing check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}