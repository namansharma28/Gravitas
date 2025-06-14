import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verify } from 'jsonwebtoken';

export async function GET() {
  try {
    const headersList = headers();
    const authHeader = headersList.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verify(token, process.env.ADMIN_JWT_SECRET || 'admin-secret-key');
      return NextResponse.json({ isAdmin: true });
    } catch (error) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Error checking admin authentication:', error);
    return NextResponse.json({ isAdmin: false, error: 'Internal server error' }, { status: 500 });
  }
}