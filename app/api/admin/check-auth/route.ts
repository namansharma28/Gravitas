import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

export async function GET() {
  try {
    // Get the admin token from cookies
    const cookieStore = cookies();
    const adminToken = cookieStore.get('admin_token');

    if (!adminToken?.value) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Verify the token
    try {
      const decoded = verify(adminToken.value, process.env.ADMIN_JWT_SECRET || 'admin-secret-key');
      return NextResponse.json({ isAdmin: true });
    } catch (error) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Error checking admin authentication:', error);
    return NextResponse.json({ isAdmin: false, error: 'Internal server error' }, { status: 500 });
  }
}