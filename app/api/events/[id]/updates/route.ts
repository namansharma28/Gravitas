import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { log } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Allow non-logged-in users to view updates
    const userId = session?.user?.id;

    const data = await request.json();
    const { 
      title, 
      content, 
      visibility, 
      media, 
      documents, 
      attachedFormId,
      targetFormId
    } = data;

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Verify event exists and user has permission
    const event = await db.collection('events').findOne({ 
      _id: new ObjectId(params.id) 
    });

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

    // Check if user can create updates
    const isAdmin = community.admins.includes(userId);
    const isMember = community.members.includes(userId);
    const isCreator = event.creatorId === userId;

    if (!isAdmin && !isMember && !isCreator) {
      return NextResponse.json({ error: 'Not authorized to create updates' }, { status: 403 });
    }

    // If visibility is "shortlisted", validate that targetFormId is provided
    if (visibility === "shortlisted" && !targetFormId) {
      return NextResponse.json({ error: 'Target form ID is required for shortlisted visibility' }, { status: 400 });
    }

    // If targetFormId is provided, verify it exists
    if (targetFormId) {
      const formExists = await db.collection('forms').findOne({
        _id: new ObjectId(targetFormId),
        eventId: params.id
      });

      if (!formExists) {
        return NextResponse.json({ error: 'Target form not found' }, { status: 404 });
      }
    }

    // Create update
    const update = await db.collection('updates').insertOne({
      eventId: params.id,
      communityId: event.communityId,
      title,
      content,
      visibility, // 'everyone', 'members', or 'shortlisted'
      media: media || [],
      documents: documents || [],
      attachedFormId: attachedFormId || null,
      targetFormId: targetFormId || null, // Store the target form ID for shortlisted visibility
      createdBy: new ObjectId(userId!), // Store as ObjectId for proper lookup
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
    });

    // If visibility is "shortlisted", create notifications for shortlisted participants
    if (visibility === "shortlisted" && targetFormId) {
      // Get all shortlisted participants for the target form
      const shortlistedResponses = await db.collection('formResponses')
        .find({
          formId: new ObjectId(targetFormId),
          eventId: new ObjectId(params.id),
          shortlisted: true
        })
        .toArray();

      // Create notifications for each shortlisted participant
      const notifications = shortlistedResponses.map(response => ({
        userId: response.userId.toString(),
        title: `New update for ${event.title}`,
        description: `${title} - You received this update because you were shortlisted`,
        type: 'event',
        linkUrl: `/updates/${update.insertedId}`,
        read: false,
        createdAt: new Date(),
      }));

      if (notifications.length > 0) {
        await db.collection('notifications').insertMany(notifications);
      }
    }

    return NextResponse.json({
      id: update.insertedId,
      title,
      content,
      visibility,
      media,
      documents,
      attachedFormId,
      targetFormId,
      createdBy: userId,
      createdAt: new Date(),
    });
  } catch (error: any) {
    console.error('Error creating update:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create update' },
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
    
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Validate ObjectId format
    if (!ObjectId.isValid(params.id)) {
      console.error("[UPDATES_GET] Invalid ObjectId format:", params.id);
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    // Get event
    const event = await db.collection('events').findOne({ 
      _id: new ObjectId(params.id) 
    });

    if (!event) {
      console.error("[UPDATES_GET] Event not found:", params.id);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get community to check permissions
    const community = await db.collection('communities').findOne({ 
      _id: new ObjectId(event.communityId) 
    });

    if (!community) {
      console.error("[UPDATES_GET] Community not found:", event.communityId);
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Determine what updates user can see
    let visibilityFilter: any = { eventId: params.id };
    
    if (!session?.user?.id) {
      // Visitors can only see public updates
      visibilityFilter.visibility = 'everyone';
    } else {
      const isMember = community.members.includes(session.user.id);
      const isAdmin = community.admins.includes(session.user.id);
      
      if (!isMember && !isAdmin) {
        // Non-members can only see public updates
        visibilityFilter.visibility = 'everyone';
      } else {
        // Members and admins can see public and members-only updates
        visibilityFilter.visibility = { $in: ['everyone', 'members'] };
        
        // For shortlisted updates, we need to check if the user is shortlisted in the target form
        // We'll handle this with an additional filter below
      }
    }

    log.debug('Updates visibility filter', { filter: visibilityFilter });

    // Get updates with community details
    let updates = await db.collection('updates')
      .aggregate([
        { $match: visibilityFilter },
        {
          $lookup: {
            from: 'communities',
            let: { communityId: { $toObjectId: "$communityId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$communityId"] } } }
            ],
            as: 'community'
          }
        },
        {
          $lookup: {
            from: 'forms',
            let: { formId: { $toObjectId: "$attachedFormId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$formId"] } } }
            ],
            as: 'attachedForm'
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray();

    // If user is logged in, check for shortlisted updates they should see
    if (session?.user?.id) {
      // Get shortlisted updates
      const shortlistedUpdates = await db.collection('updates')
        .aggregate([
          { 
            $match: { 
              eventId: params.id,
              visibility: 'shortlisted',
              targetFormId: { $exists: true, $ne: null }
            } 
          },
          {
            $lookup: {
              from: 'formResponses',
              let: { 
                targetFormId: { $toObjectId: "$targetFormId" },
                userId: new ObjectId(session.user.id)
              },
              pipeline: [
                { 
                  $match: { 
                    $expr: { 
                      $and: [
                        { $eq: ["$formId", "$$targetFormId"] },
                        { $eq: ["$userId", "$$userId"] },
                        { $eq: ["$shortlisted", true] }
                      ]
                    }
                  }
                }
              ],
              as: 'userShortlisted'
            }
          },
          // Only include updates where the user is shortlisted
          { $match: { "userShortlisted.0": { $exists: true } } },
          {
            $lookup: {
              from: 'communities',
              let: { communityId: { $toObjectId: "$communityId" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$communityId"] } } }
              ],
              as: 'community'
            }
          },
          {
            $lookup: {
              from: 'forms',
              let: { formId: { $toObjectId: "$attachedFormId" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$formId"] } } }
              ],
              as: 'attachedForm'
            }
          }
        ])
        .toArray();

      // Combine with other updates
      updates = [...updates, ...shortlistedUpdates];
      
      // Sort by creation date
      updates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    log.debug('Updates found', { count: updates.length });

    // Transform the data
    const transformedUpdates = updates.map(update => ({
      id: update._id.toString(),
      title: update.title,
      content: update.content,
      visibility: update.visibility,
      media: update.media || [],
      documents: update.documents || [],
      attachedForm: update.attachedForm[0] ? {
        id: update.attachedForm[0]._id.toString(),
        title: update.attachedForm[0].title,
        description: update.attachedForm[0].description,
      } : null,
      community: {
        id: update.community[0]?._id.toString() || update.communityId,
        name: update.community[0]?.name || 'Unknown Community',
        handle: update.community[0]?.handle || 'unknown',
        avatar: update.community[0]?.avatar || '',
      },
      comments: update.comments || [],
      createdAt: update.createdAt,
    }));

    log.debug('Updates transformed', { count: transformedUpdates.length });

    return NextResponse.json(transformedUpdates);
  } catch (error: any) {
    console.error('[UPDATES_GET] Error fetching updates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch updates' },
      { status: 500 }
    );
  }
}