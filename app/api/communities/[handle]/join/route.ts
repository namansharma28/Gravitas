import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const { userId } = await request.json();

    // Check if the requesting user is an admin
    if (!community.admins.includes(session.user.id)) {
      return NextResponse.json({ error: 'Only admins can add members' }, { status: 403 });
    }

    // Check if user is already a member
    if (community.members.includes(userId)) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    // Add user to community members
    await db.collection('communities').updateOne(
      { _id: community._id },
      { $addToSet: { members: userId } }
    );

    // Send notification to community admins about new member
    try {
      const newMember = await db.collection('users').findOne({ _id: new ObjectId(userId) });
      if (newMember) {
        const adminNotifications = community.admins
          .filter((adminId: string) => adminId !== session.user.id) // Don't notify the admin who added the member
          .map((adminId: string) => ({
            userId: adminId,
            type: 'community_joined',
            title: `New Member in ${community.name}`,
            description: `${newMember.name} joined ${community.name}`,
            linkUrl: `/communities/${community.handle}`,
            communityId: community._id,
            senderId: session.user.id,
            read: false,
            createdAt: new Date(),
          }));

        if (adminNotifications.length > 0) {
          await db.collection('notifications').insertMany(adminNotifications);
        }
      }
    } catch (notificationError) {
      console.error('Error sending community join notifications:', notificationError);
      // Don't fail the join if notifications fail
    }

    return NextResponse.json({ success: true, message: 'Member added successfully' });
  } catch (error: any) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const { userId } = await request.json();

    // Check if user can remove members (admin or removing themselves)
    const isAdmin = community.admins.includes(session.user.id);
    const isRemovingSelf = userId === session.user.id;

    if (!isAdmin && !isRemovingSelf) {
      return NextResponse.json({ error: 'Not authorized to remove members' }, { status: 403 });
    }

    // Remove user from community members
    await db.collection('communities').updateOne(
      { _id: community._id },
      { $pull: { members: userId } }
    );

    // Also remove from followers if they were following
    await db.collection('follows').deleteOne({
      userId: userId,
      communityId: community._id.toString()
    });

    return NextResponse.json({ success: true, message: 'Member removed successfully' });
  } catch (error: any) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove member' },
      { status: 500 }
    );
  }
}