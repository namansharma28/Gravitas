import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { 
      title, 
      content, 
      visibility, 
      media, 
      documents, 
      attachedFormId 
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
    const isAdmin = community.admins.includes(session.user.id);
    const isMember = community.members.includes(session.user.id);
    const isCreator = event.creatorId === session.user.id;

    if (!isAdmin && !isMember && !isCreator) {
      return NextResponse.json({ error: 'Not authorized to create updates' }, { status: 403 });
    }

    // Create update
    const update = await db.collection('updates').insertOne({
      eventId: params.id,
      communityId: event.communityId,
      title,
      content,
      visibility, // 'everyone' or 'members'
      media: media || [],
      documents: documents || [],
      attachedFormId: attachedFormId || null,
      createdBy: new ObjectId(session.user.id), // Store as ObjectId for proper lookup
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
    });

    return NextResponse.json({
      id: update.insertedId,
      title,
      content,
      visibility,
      media,
      documents,
      attachedFormId,
      createdBy: session.user.id,
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
      }
      // Members and admins can see all updates (no additional filter needed)
    }

    console.log("[UPDATES_GET] Visibility filter:", visibilityFilter);

    // Get updates with community details
    const updates = await db.collection('updates')
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

    console.log("[UPDATES_GET] Found updates:", updates.length);

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

    console.log("[UPDATES_GET] Transformed updates:", transformedUpdates.length);

    return NextResponse.json(transformedUpdates);
  } catch (error: any) {
    console.error('[UPDATES_GET] Error fetching updates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch updates' },
      { status: 500 }
    );
  }
}