import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('gravitas');

    // Find verification token
    const verificationToken = await db.collection('verification_tokens').findOne({
      token,
      expires: { $gt: new Date() }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user as verified
    const result = await db.collection('users').updateOne(
      { email: verificationToken.identifier },
      {
        $set: {
          emailVerified: new Date(),
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the verification token
    await db.collection('verification_tokens').deleteOne({
      token
    });

    // Redirect to success page
    return NextResponse.redirect(new URL('/auth/email-verified', request.url));
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}