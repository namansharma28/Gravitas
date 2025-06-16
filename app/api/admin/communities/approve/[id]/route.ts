import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verify } from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('Authorization');
    console.log('Auth header:', authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or invalid format'); // Debug log
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token); // Debug log
    
    try {
      const decoded = verify(token, process.env.ADMIN_JWT_SECRET || 'admin-secret-key');
      console.log('Decoded token:', decoded); // Debug log
      if (!decoded || (decoded as any).role !== 'admin') {
        console.log('Invalid token or not admin role'); // Debug log
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (error) {
      console.error('Token verification error:', error); // Debug log
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: 'admin',
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
      title: 'Community Approved',
      description: `Your community "${community.name}" has been approved and is now public.`,
      type: 'community',
      linkUrl: `/communities/${community.handle}`,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Community approved successfully'
    });
  } catch (error: any) {
    console.error('Error approving community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve community' },
      { status: 500 }
    );
  }
}