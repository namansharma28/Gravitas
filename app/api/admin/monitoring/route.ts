import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimiter } from '@/lib/rate-limiter';
import { errorMonitor } from '@/lib/error-monitoring';
import { apiLogger } from '@/lib/api-logger';
import { apiCache } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow authenticated users (you may want to add admin check)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'all';

    const data: any = {
      timestamp: new Date().toISOString(),
    };

    // Rate limiter stats
    if (section === 'all' || section === 'ratelimit') {
      data.rateLimiter = rateLimiter.getStats();
    }

    // Error monitoring stats
    if (section === 'all' || section === 'errors') {
      data.errors = {
        stats: errorMonitor.getStats(),
        recentLogs: errorMonitor.getLogs(50),
      };
    }

    // API logging stats
    if (section === 'all' || section === 'api') {
      const timeRange = (searchParams.get('timeRange') as 'hour' | 'day' | 'all') || 'hour';
      data.apiLogs = {
        stats: apiLogger.getStats(timeRange),
        recentErrors: apiLogger.getRecentErrors(20),
      };
    }

    // Cache stats
    if (section === 'all' || section === 'cache') {
      data.cache = apiCache.getStats();
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}

// Clear specific monitoring data
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow authenticated users (you may want to add admin check)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    switch (section) {
      case 'errors':
        errorMonitor.clearLogs();
        break;
      case 'api':
        apiLogger.clear();
        break;
      case 'cache':
        apiCache.clear();
        break;
      case 'all':
        errorMonitor.clearLogs();
        apiLogger.clear();
        apiCache.clear();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid section. Use: errors, api, cache, or all' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `${section} data cleared successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error clearing monitoring data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear monitoring data' },
      { status: 500 }
    );
  }
}
