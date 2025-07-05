import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    const client = await clientPromise;
    const db = client.db('gravitas');

    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // If community is pending, only show to admins or the creator
    if (community.status === 'pending') {
      const isCreator = session?.user?.id === community.creatorId;
      const isAdmin = community.admins.includes(session?.user?.id);
      
      if (!isCreator && !isAdmin && (session?.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: 'Community not found' }, { status: 404 });
      }
    }

    // Check user's relationship with the community
    let userPermissions = {
      isVisitor: true,
      isUser: false,
      isMember: false,
      isFollower: false,
      isAdmin: false,
      canEdit: false,
      canDelete: false,
      canCreateEvents: false,
      canCreateForms: false,
      canCreateUpdates: false,
      canManageMembers: false,
      canViewMembers: true,
      canFollow: false,
      canJoin: false,
      isPending: community.status === 'pending',
      isRejected: community.status === 'rejected',
    };

    if (session?.user?.id) {
      userPermissions.isUser = true;
      userPermissions.isVisitor = false;

      const isMember = community.members.includes(session.user.id);
      const isAdmin = community.admins.includes(session.user.id);
      const isSystemAdmin = (session.user as any)?.role === 'admin';

      // Check if user is following the community
      const followRecord = await db.collection('follows').findOne({
        userId: session.user.id,
        communityId: community._id.toString()
      });
      const isFollower = !!followRecord;

      userPermissions.isMember = isMember;
      userPermissions.isAdmin = isAdmin;
      userPermissions.isFollower = isFollower;

      // Set permissions based on role
      if (isAdmin || isSystemAdmin) {
        userPermissions.canEdit = true;
        userPermissions.canDelete = true;
        userPermissions.canCreateEvents = true;
        userPermissions.canCreateForms = true;
        userPermissions.canCreateUpdates = true;
        userPermissions.canManageMembers = true;
      } else if (isMember) {
        userPermissions.canCreateEvents = true;
        userPermissions.canCreateForms = true;
        userPermissions.canCreateUpdates = true;
      } else {
        // Non-members can follow
        userPermissions.canFollow = !isFollower;
      }
    }

    return NextResponse.json({
      community: {
        id: community._id.toString(),
        name: community.name,
        handle: community.handle,
        description: community.description,
        banner: community.banner,
        avatar: community.avatar,
        website: community.website,
        location: community.location,
        membersCount: community.members.length,
        followersCount: community.followersCount || 0,
        isVerified: community.isVerified,
        status: community.status || 'approved', // Default for backward compatibility
        createdAt: community.createdAt
      },
      userPermissions
    });
  } catch (error: any) {
    console.error('Error fetching community permissions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch community permissions' },
      { status: 500 }
    );
  }
}