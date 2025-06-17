import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const client = new MongoClient(uri);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    console.log('Auth header in approve:', authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or invalid format in approve'); // Debug log
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('Token in approve:', token); // Debug log

    if (!process.env.ADMIN_JWT_SECRET) {
      console.error('ADMIN_JWT_SECRET is not defined');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    try {
      const decoded = verify(token, process.env.ADMIN_JWT_SECRET);
      console.log('Decoded token in approve:', decoded); // Debug log

      if (!decoded || typeof decoded === 'string' || decoded.role !== 'admin') {
        console.log('Invalid token or not admin in approve'); // Debug log
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const { id } = params;
      if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: 'Invalid community ID' },
          { status: 400 }
        );
      }

      await client.connect();
      console.log('Connected to database in approve'); // Debug log

      const db = client.db();
      const community = await db.collection('communities').findOne({ _id: new ObjectId(id) });
      console.log('Found community in approve:', community); // Debug log

      if (!community) {
        return NextResponse.json(
          { error: 'Community not found' },
          { status: 404 }
        );
      }

      const result = await db.collection('communities').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'approved' } }
      );
      console.log('Update result in approve:', result); // Debug log

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { error: 'Failed to approve community' },
          { status: 500 }
        );
      }

      // Create notification for the community creator
      if (community.creatorId) {
        await db.collection('notifications').insertOne({
          userId: community.creatorId,
          type: 'community_approved',
          message: `Your community "${community.name}" has been approved!`,
          read: false,
          createdAt: new Date(),
          communityId: id
        });
      }

      return NextResponse.json({ message: 'Community approved successfully' });
    } catch (error) {
      console.error('Token verification error in approve:', error);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error in approve community:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}