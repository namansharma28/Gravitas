import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    const user = await db.collection('users').findOne(
      { email: email.toLowerCase() },
      { projection: { _id: 1, name: 1, email: 1, image: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
    });
  } catch (error: any) {
    console.error('Error finding user by email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to find user' },
      { status: 500 }
    );
  }
}