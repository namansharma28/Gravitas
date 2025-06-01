import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Get community
    const community = await db.collection('communities').findOne({ handle: params.handle });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Convert member IDs to ObjectId
    const memberObjectIds = community.members.map((id: string) => new ObjectId(id));

    // Get member details
    const members = await db.collection('users')
      .find({ _id: { $in: memberObjectIds } })
      .project({
        _id: 1,
        name: 1,
        image: 1,
        email: 1
      })
      .toArray();

    // Map member data
    const memberData = members.map(member => ({
      id: member._id.toString(),
      name: member.name,
      image: member.image,
      email: member.email,
      isAdmin: community.admins.includes(member._id.toString())
    }));

    return NextResponse.json(memberData);
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch members' },
      { status: 500 }
    );
  }
} 