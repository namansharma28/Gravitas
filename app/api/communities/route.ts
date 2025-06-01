import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Community } from '@/lib/models/community';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in API route:', session); // Debug log

    if (!session?.user?.id) {
      console.log('No user ID in session:', session); // Debug log
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, handle, description, banner, avatar, website, location } = data;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('gravitas');

    // Check if handle already exists
    const existingCommunity = await db.collection('communities').findOne({ handle });
    if (existingCommunity) {
      return NextResponse.json(
        { error: 'Community handle already exists' },
        { status: 400 }
      );
    }

    // Create new community
    const community = await db.collection('communities').insertOne({
      name,
      handle,
      description,
      banner,
      avatar,
      website,
      location,
      admins: [session.user.id],
      members: [session.user.id],
      events: [],
      updates: [],
      followersCount: 0,
      isVerified: false,
      createdAt: new Date()
    });

    return NextResponse.json({
      id: community.insertedId,
      name,
      handle,
      description,
      banner,
      avatar,
      website,
      location,
      admins: [session.user.id],
      members: [session.user.id],
      events: [],
      updates: [],
      followersCount: 0,
      isVerified: false,
      createdAt: new Date()
    });
  } catch (error: any) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create community' },
      { status: 500 }
    );
  }
}