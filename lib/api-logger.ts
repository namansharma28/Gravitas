// API request logging system

interface APILog {
  timestamp: string;
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  error?: string;
}

class APILogger {
  private logs: APILog[] = [];
  private maxLogs: number = 5000;

  constructor() {
    // Periodic cleanup
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 10 * 60 * 1000); // Every 10 minutes
    }
  }

  /**
   * Log an API request
   */
  log(logEntry: Omit<APILog, 'timestamp'>): void {
    const log: APILog = {
      timestamp: new Date().toISOString(),
      ...logEntry,
    };

    this.logs.push(log);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = this.getStatusEmoji(log.statusCode);
      const color = this.getStatusColor(log.statusCode);
      console.log(
        `${emoji} [${log.method}] ${log.url} - ${log.statusCode} (${log.duration}ms)`,
        log.userId ? `[User: ${log.userId}]` : ''
      );
    }
  }

  /**
   * Get logs with filters
   */
  getLogs(filters?: {
    method?: string;
    statusCode?: number;
    userId?: string;
    limit?: number;
    since?: Date;
  }): APILog[] {
    let filtered = [...this.logs];

    if (filters?.method) {
      filtered = filtered.filter(log => log.method === filters.method);
    }

    if (filters?.statusCode) {
      filtered = filtered.filter(log => log.statusCode === filters.statusCode);
    }

    if (filters?.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters?.since) {
      filtered = filtered.filter(
        log => new Date(log.timestamp) >= filters.since!
      );
    }

    const limit = filters?.limit || 100;
    return filtered.slice(-limit);
  }

  /**
   * Get API statistics
   */
  getStats(timeRange: 'hour' | 'day' | 'all' = 'hour') {
    const now = Date.now();
    let cutoff = 0;

    switch (timeRange) {
      case 'hour':
        cutoff = now - 60 * 60 * 1000;
        break;
      case 'day':
        cutoff = now - 24 * 60 * 60 * 1000;
        break;
      case 'all':
        cutoff = 0;
        break;
    }

    const relevantLogs = this.logs.filter(
      log => new Date(log.timestamp).getTime() > cutoff
    );

    const totalRequests = relevantLogs.length;
    const successfulRequests = relevantLogs.filter(
      log => log.statusCode >= 200 && log.statusCode < 300
    ).length;
    const clientErrors = relevantLogs.filter(
      log => log.statusCode >= 400 && log.statusCode < 500
    ).length;
    const serverErrors = relevantLogs.filter(
      log => log.statusCode >= 500
    ).length;

    const durations = relevantLogs.map(log => log.duration);
    const avgDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;

    // Top endpoints
    const endpointCounts: Record<string, number> = {};
    relevantLogs.forEach(log => {
      const path = new URL(log.url).pathname;
      endpointCounts[path] = (endpointCounts[path] || 0) + 1;
    });

    const topEndpoints = Object.entries(endpointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Method distribution
    const methodCounts: Record<string, number> = {};
    relevantLogs.forEach(log => {
      methodCounts[log.method] = (methodCounts[log.method] || 0) + 1;
    });

    // Slow requests (>2s)
    const slowRequests = relevantLogs.filter(log => log.duration > 2000).length;

    return {
      timeRange,
      totalRequests,
      successfulRequests,
      clientErrors,
      serverErrors,
      successRate:
        totalRequests > 0
          ? ((successfulRequests / totalRequests) * 100).toFixed(2) + '%'
          : '0%',
      performance: {
        avgDuration: Math.round(avgDuration),
        minDuration: Math.round(minDuration),
        maxDuration: Math.round(maxDuration),
        slowRequests,
      },
      topEndpoints,
      methodDistribution: methodCounts,
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 50): APILog[] {
    return this.logs
      .filter(log => log.statusCode >= 400)
      .slice(-limit);
  }

  /**
   * Cleanup old logs
   */
  private cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const initialCount = this.logs.length;

    this.logs = this.logs.filter(
      log => new Date(log.timestamp).getTime() > oneHourAgo
    );

    const deletedCount = initialCount - this.logs.length;
    if (deletedCount > 0) {
      console.log(`🧹 API logger cleanup: removed ${deletedCount} old logs`);
    }
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Get status emoji
   */
  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 500) return '❌';
    if (statusCode >= 400) return '⚠️';
    if (statusCode >= 300) return '↪️';
    if (statusCode >= 200) return '✅';
    return 'ℹ️';
  }

  /**
   * Get status color
   */
  private getStatusColor(statusCode: number): string {
    if (statusCode >= 500) return 'red';
    if (statusCode >= 400) return 'yellow';
    if (statusCode >= 300) return 'cyan';
    if (statusCode >= 200) return 'green';
    return 'gray';
  }
}

// Export singleton instance
export const apiLogger = new APILogger();

/**
 * API logging middleware
 */
export function withAPILogging(
  handler: (request: Request, context?: any) => Promise<Response>,
  options: { getUserId?: (request: Request) => Promise<string | undefined> } = {}
) {
  return async (request: Request, context?: any): Promise<Response> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      // Get user ID if available
      const userId = options.getUserId
        ? await options.getUserId(request)
        : undefined;

      // Execute handler
      const response = await handler(request, context);
      const duration = Date.now() - startTime;

      // Get client info
      const userAgent = request.headers.get('user-agent') || undefined;
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const ip = forwarded?.split(',')[0] || realIp || undefined;

      // Log the request
      apiLogger.log({
        requestId,
        method: request.method,
        url: request.url,
        statusCode: response.status,
        duration,
        userAgent,
        ip,
        userId,
      });

      // Add request ID to response headers
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Request-ID', requestId);

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      apiLogger.log({
        requestId,
        method: request.method,
        url: request.url,
        statusCode: 500,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
}

/**
 * Export logs to file (for debugging)
 */
export function exportLogs(): string {
  const logs = apiLogger.getLogs({ limit: 10000 });
  return JSON.stringify(logs, null, 2);
}
