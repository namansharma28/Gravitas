import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiCache } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admins to view cache stats
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = apiCache.getStats();
    const popularEntries = apiCache.getPopularEntries(10);

    return NextResponse.json({
      stats,
      popularEntries,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cache stats' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admins to clear cache
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    apiCache.clear();

    return NextResponse.json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
