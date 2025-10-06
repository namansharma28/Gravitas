import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, title, description, linkUrl, eventId, communityId, targetUsers } = await request.json();
    
    const client = await clientPromise;
    const db = client.db('gravitas');

    let recipients: string[] = [];

    // Determine recipients based on type and context
    if (targetUsers && Array.isArray(targetUsers)) {
      recipients = targetUsers;
    } else if (eventId) {
      // Get event attendees and interested users
      const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });
      if (event) {
        recipients = [...(event.attendees || []), ...(event.interested || [])];
        
        // Also get community members if it's a community event
        if (event.communityId) {
          const community = await db.collection('communities').findOne({ _id: new ObjectId(event.communityId) });
          if (community) {
            recipients = Array.from(new Set([...recipients, ...(community.members || [])]));
          }
        }
      }
    } else if (communityId) {
      // Get community members
      const community = await db.collection('communities').findOne({ _id: new ObjectId(communityId) });
      if (community) {
        recipients = community.members || [];
      }
    }

    // Remove sender from recipients
    recipients = recipients.filter(userId => userId !== session.user.id);

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
    }

    // Filter recipients based on their notification preferences
    const userPreferences = await db.collection('notificationPreferences')
      .find({ userId: { $in: recipients } })
      .toArray();

    const filteredRecipients = recipients.filter(userId => {
      const userPref = userPreferences.find(pref => pref.userId === userId);
      if (!userPref) return true; // Default to enabled if no preferences set
      
      // Map notification types to preference keys
      const prefKey = type.replace('_', '');
      return userPref.preferences?.[prefKey] !== false;
    });

    if (filteredRecipients.length === 0) {
      return NextResponse.json({ 
        success: true, 
        recipientCount: 0,
        message: 'No recipients have this notification type enabled' 
      });
    }

    // Create notifications for filtered recipients
    const notifications = filteredRecipients.map(userId => ({
      userId,
      type,
      title,
      description,
      linkUrl,
      eventId: eventId ? new ObjectId(eventId) : undefined,
      communityId: communityId ? new ObjectId(communityId) : undefined,
      senderId: session.user.id,
      read: false,
      createdAt: new Date(),
    }));

    await db.collection('notifications').insertMany(notifications);

    return NextResponse.json({ 
      success: true, 
      recipientCount: filteredRecipients.length,
      message: `Notification sent to ${filteredRecipients.length} user${filteredRecipients.length > 1 ? 's' : ''}` 
    });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}