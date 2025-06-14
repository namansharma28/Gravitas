import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Hardcoded admin credentials (in a real app, these would be stored securely)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Create JWT token
    const token = sign(
      { 
        username,
        role: 'admin',
      },
      process.env.ADMIN_JWT_SECRET || 'admin-secret-key',
      { expiresIn: '24h' }
    );

    // Set cookie
    const cookieStore = cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      sameSite: 'strict',
    });

    return NextResponse.json({ 
      success: true,
      message: 'Admin authenticated successfully'
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}