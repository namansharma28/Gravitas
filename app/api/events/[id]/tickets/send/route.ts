export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { sendTicketEmail } from "@/lib/ticket-email";

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

    const { recipients, emailSubject, emailMessage, includeQR } = await request.json();

    if (!Array.isArray(recipients) || !emailSubject || !emailMessage) {
      return NextResponse.json(
        { error: "Invalid request body" },
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

    // Check if user can send tickets (admin or member)
    const isAdmin = community.admins.includes(session.user.id);
    const isMember = community.members.includes(session.user.id);

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Not authorized to send tickets' }, { status: 403 });
    }

    // Send tickets to all recipients
    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        await sendTicketEmail({
          recipientName: recipient.name,
          recipientEmail: recipient.email,
          eventDetails: {
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            description: event.description,
          },
          emailSubject,
          emailMessage,
          includeQR,
          participantId: recipient.id,
          formId: recipient.formId, // Include formId for form-specific QR codes
          eventId: params.id,
        });

        results.push({
          email: recipient.email,
          status: 'sent',
        });

        // Log the ticket send in database
        await db.collection('ticketSends').insertOne({
          eventId: new ObjectId(params.id),
          formId: recipient.formId ? new ObjectId(recipient.formId) : null,
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          sentBy: new ObjectId(session.user.id),
          emailSubject,
          includeQR,
          sentAt: new Date(),
        });
      } catch (error: any) {
        console.error(`Failed to send ticket to ${recipient.email}:`, error);
        errors.push({
          email: recipient.email,
          error: error.message,
        });
      }
    }

    const successCount = results.length;
    const errorCount = errors.length;

    if (errorCount === 0) {
      return NextResponse.json({
        success: true,
        message: `Successfully sent tickets to ${successCount} participant(s)`,
        results,
      });
    } else if (successCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Failed to send any tickets",
        errors,
      }, { status: 500 });
    } else {
      return NextResponse.json({
        success: true,
        message: `Sent tickets to ${successCount} participant(s), ${errorCount} failed`,
        results,
        errors,
      });
    }
  } catch (error) {
    console.error("Error sending tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}