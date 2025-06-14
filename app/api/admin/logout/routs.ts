import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the admin token cookie
    const cookieStore = cookies();
    cookieStore.delete('admin_token');

    return NextResponse.json({ 
      success: true,
      message: 'Admin logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}