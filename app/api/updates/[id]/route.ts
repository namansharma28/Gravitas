import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    const client = await clientPromise;
    const db = client.db('gravitas');

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid update ID format' },
        { status: 400 }
      );
    }

    // Get update with community and event details
    const updates = await db.collection('updates')
      .aggregate([
        { $match: { _id: new ObjectId(params.id) } },
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
            from: 'events',
            let: { eventId: { $toObjectId: "$eventId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$eventId"] } } }
            ],
            as: 'event'
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

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    const update = updates[0];
    const community = update.community[0];
    const event = update.event[0];

    // Check visibility permissions
    if (update.visibility === 'members') {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const isMember = community?.members.includes(session.user.id);
      const isAdmin = community?.admins.includes(session.user.id);

      if (!isMember && !isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (update.visibility === 'shortlisted') {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Check if user is shortlisted in the target form
      if (update.targetFormId) {
        const isShortlisted = await db.collection('formResponses').findOne({
          formId: new ObjectId(update.targetFormId),
          userId: new ObjectId(session.user.id),
          shortlisted: true
        });

        if (!isShortlisted) {
          // Also allow admins and event creator to view
          const isAdmin = community?.admins.includes(session.user.id);
          const isCreator = event?.creatorId === session.user.id;
          
          if (!isAdmin && !isCreator) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }
        }
      } else {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Check if user can edit this update
    let canEdit = false;
    if (session?.user?.id && community) {
      const isMember = community.members.includes(session.user.id);
      const isAdmin = community.admins.includes(session.user.id);
      canEdit = isMember || isAdmin;
    }

    // Transform the data
    const transformedUpdate = {
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
        id: community?._id.toString() || update.communityId,
        name: community?.name || 'Unknown Community',
        handle: community?.handle || 'unknown',
        avatar: community?.avatar || '',
      },
      comments: update.comments || [],
      createdAt: update.createdAt,
      eventId: update.eventId,
      eventTitle: event?.title || 'Unknown Event',
      targetFormId: update.targetFormId,
      userPermissions: {
        canEdit,
      },
    };

    return NextResponse.json(transformedUpdate);
  } catch (error: any) {
    console.error('Error fetching update:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch update' },
      { status: 500 }
    );
  }
}