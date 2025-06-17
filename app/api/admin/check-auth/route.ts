import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verify } from 'jsonwebtoken';

export async function GET() {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    console.log('Auth header in check-auth:', authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or invalid format in check-auth'); // Debug log
      return NextResponse.json(
        { isAdmin: false, error: 'No auth header or invalid format' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('Token in check-auth:', token); // Debug log

    if (!process.env.ADMIN_JWT_SECRET) {
      console.error('ADMIN_JWT_SECRET is not defined');
      return NextResponse.json(
        { isAdmin: false, error: 'Internal server error' },
        { status: 500 }
      );
    }

    try {
      const decoded = verify(token, process.env.ADMIN_JWT_SECRET);
      console.log('Decoded token in check-auth:', decoded); // Debug log

      if (!decoded || typeof decoded === 'string' || decoded.role !== 'admin') {
        console.log('Invalid token or not admin in check-auth'); // Debug log
        return NextResponse.json(
          { isAdmin: false, error: 'Invalid token or not admin' },
          { status: 401 }
        );
      }

      return NextResponse.json({ isAdmin: true });
    } catch (error) {
      console.error('Token verification error in check-auth:', error);
      return NextResponse.json(
        { isAdmin: false, error: 'Token verification failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in check-auth:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}