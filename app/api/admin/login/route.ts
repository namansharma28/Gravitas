import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// Hardcoded admin credentials (in a real app, these would be stored securely)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('Login attempt for username:', username); // Debug log

    // Validate credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      console.log('Invalid credentials'); // Debug log
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create JWT token with admin role
    if (!process.env.ADMIN_JWT_SECRET) {
      console.error('ADMIN_JWT_SECRET is not defined');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    const token = sign(
      { username, role: 'admin' },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Generated token:', token); // Debug log

    // Return the token and role
    return NextResponse.json({
      token,
      role: 'admin',
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}