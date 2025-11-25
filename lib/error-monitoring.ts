// Error monitoring and logging system
// Integrates with Sentry or similar services

interface ErrorContext {
  userId?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  requestId?: string;
  [key: string]: any;
}

interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  error?: Error;
  context?: ErrorContext;
  stack?: string;
}

class ErrorMonitor {
  private logs: ErrorLog[] = [];
  private maxLogs: number = 1000;
  private sentryEnabled: boolean = false;

  constructor() {
    // Check if Sentry is configured
    this.sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;
    
    if (this.sentryEnabled) {
      console.log('✅ Error monitoring enabled with Sentry');
    } else {
      console.log('ℹ️ Error monitoring using local logging (Sentry not configured)');
    }
  }

  /**
   * Log an error
   */
  logError(
    message: string,
    error?: Error | unknown,
    context?: ErrorContext
  ): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: error instanceof Error ? error : undefined,
      context,
      stack: error instanceof Error ? error.stack : undefined,
    };

    // Add to local logs
    this.addLog(errorLog);

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error:', message, error, context);
    }

    // Send to Sentry if configured
    if (this.sentryEnabled && typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error || new Error(message), {
        contexts: { custom: context },
      });
    }
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: ErrorContext): void {
    const warningLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
    };

    this.addLog(warningLog);

    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Warning:', message, context);
    }

    // Send to Sentry as warning
    if (this.sentryEnabled && typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(message, {
        level: 'warning',
        contexts: { custom: context },
      });
    }
  }

  /**
   * Log info
   */
  logInfo(message: string, context?: ErrorContext): void {
    const infoLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
    };

    this.addLog(infoLog);

    if (process.env.NODE_ENV === 'development') {
      console.log('ℹ️ Info:', message, context);
    }
  }

  /**
   * Add log to storage
   */
  private addLog(log: ErrorLog): void {
    this.logs.push(log);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Get recent logs
   */
  getLogs(limit: number = 100): ErrorLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get error statistics
   */
  getStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentLogs = this.logs.filter(
      log => new Date(log.timestamp).getTime() > oneHourAgo
    );
    const dailyLogs = this.logs.filter(
      log => new Date(log.timestamp).getTime() > oneDayAgo
    );

    return {
      total: this.logs.length,
      lastHour: {
        total: recentLogs.length,
        errors: recentLogs.filter(l => l.level === 'error').length,
        warnings: recentLogs.filter(l => l.level === 'warn').length,
      },
      last24Hours: {
        total: dailyLogs.length,
        errors: dailyLogs.filter(l => l.level === 'error').length,
        warnings: dailyLogs.filter(l => l.level === 'warn').length,
      },
    };
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId: string, email?: string, username?: string): void {
    if (this.sentryEnabled && typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.setUser({
        id: userId,
        email,
        username,
      });
    }
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    if (this.sentryEnabled && typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.setUser(null);
    }
  }
}

// Export singleton instance
export const errorMonitor = new ErrorMonitor();

/**
 * Error boundary wrapper for API routes
 */
export function withErrorMonitoring(
  handler: (request: Request, context?: any) => Promise<Response>,
  routeName: string
) {
  return async (request: Request, context?: any): Promise<Response> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      const response = await handler(request, context);
      const duration = Date.now() - startTime;

      // Log slow requests
      if (duration > 3000) {
        errorMonitor.logWarning(`Slow request detected: ${routeName}`, {
          url: request.url,
          method: request.method,
          duration,
          requestId,
        });
      }

      // Log errors (4xx, 5xx)
      if (response.status >= 400) {
        const level = response.status >= 500 ? 'error' : 'warn';
        const message = `${level === 'error' ? 'Server' : 'Client'} error in ${routeName}`;
        
        if (level === 'error') {
          errorMonitor.logError(message, undefined, {
            url: request.url,
            method: request.method,
            statusCode: response.status,
            duration,
            requestId,
          });
        } else {
          errorMonitor.logWarning(message, {
            url: request.url,
            method: request.method,
            statusCode: response.status,
            duration,
            requestId,
          });
        }
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      errorMonitor.logError(`Unhandled error in ${routeName}`, error, {
        url: request.url,
        method: request.method,
        duration,
        requestId,
      });

      // Return error response
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          requestId,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
          },
        }
      );
    }
  };
}

/**
 * Helper to track API performance
 */
export function trackAPIPerformance(
  endpoint: string,
  duration: number,
  statusCode: number
): void {
  // Log slow APIs
  if (duration > 2000) {
    errorMonitor.logWarning(`Slow API: ${endpoint}`, {
      duration,
      statusCode,
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : '✅';
    console.log(`${emoji} ${endpoint}: ${duration}ms (${statusCode})`);
  }
}
