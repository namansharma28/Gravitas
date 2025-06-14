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
    
    // Check if the user is an admin
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await request.json();

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid community ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Find the community
    const community = await db.collection('communities').findOne({
      _id: new ObjectId(params.id)
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Update the community status
    const result = await db.collection('communities').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status: 'rejected',
          rejectionReason: reason,
          rejectedAt: new Date(),
          rejectedBy: 'admin',
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Failed to update community' }, { status: 500 });
    }

    // Create a notification for the community creator
    await db.collection('notifications').insertOne({
      userId: community.creatorId || community.admins[0],
      title: 'Community Rejected',
      description: `Your community "${community.name}" has been rejected. Reason: ${reason}`,
      type: 'community',
      linkUrl: `/communities/${community.handle}`,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Community rejected successfully'
    });
  } catch (error: any) {
    console.error('Error rejecting community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject community' },
      { status: 500 }
    );
  }
}