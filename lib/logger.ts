// Production-ready logging utility
// Integrates with error monitoring and provides structured logging

import { errorMonitor } from './error-monitoring';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`🔍 [DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info logs - important information
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`ℹ️ [INFO] ${message}`, context || '');
    }
    
    // Send to monitoring in production
    if (this.isProduction && context) {
      errorMonitor.logInfo(message, context);
    }
  }

  /**
   * Warning logs - potential issues
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`⚠️ [WARN] ${message}`, context || '');
    
    // Always send warnings to monitoring
    errorMonitor.logWarning(message, context);
  }

  /**
   * Error logs - actual errors
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`❌ [ERROR] ${message}`, error, context || '');
    
    // Always send errors to monitoring
    errorMonitor.logError(message, error, context);
  }

  /**
   * Success logs - successful operations
   */
  success(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`✅ [SUCCESS] ${message}`, context || '');
    }
  }

  /**
   * Performance logs - timing information
   */
  perf(message: string, duration: number, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`⏱️ [PERF] ${message}: ${duration}ms`, context || '');
    }
    
    // Log slow operations in production
    if (this.isProduction && duration > 1000) {
      errorMonitor.logWarning(`Slow operation: ${message}`, {
        duration,
        ...context,
      });
    }
  }

  /**
   * API logs - API request/response
   */
  api(method: string, endpoint: string, status: number, duration?: number): void {
    const emoji = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';
    const durationStr = duration ? ` (${duration}ms)` : '';
    
    if (this.isDevelopment) {
      console.log(`${emoji} [API] ${method} ${endpoint} - ${status}${durationStr}`);
    }
  }

  /**
   * Auth logs - authentication events
   */
  auth(event: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`🔐 [AUTH] ${event}`, context || '');
    }
    
    // Log auth events in production for security
    if (this.isProduction) {
      errorMonitor.logInfo(`Auth: ${event}`, context);
    }
  }

  /**
   * Database logs - database operations
   */
  db(operation: string, duration?: number, context?: LogContext): void {
    if (this.isDevelopment) {
      const durationStr = duration ? ` (${duration}ms)` : '';
      console.log(`🗄️ [DB] ${operation}${durationStr}`, context || '');
    }
    
    // Log slow queries in production
    if (this.isProduction && duration && duration > 1000) {
      errorMonitor.logWarning(`Slow DB query: ${operation}`, {
        duration,
        ...context,
      });
    }
  }

  /**
   * Cache logs - cache operations
   */
  cache(operation: 'HIT' | 'MISS' | 'SET' | 'DELETE', key: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const emoji = operation === 'HIT' ? '✅' : operation === 'MISS' ? '❌' : '💾';
      console.log(`${emoji} [CACHE] ${operation} - ${key}`, context || '');
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (msg: string, ctx?: LogContext) => logger.debug(msg, ctx),
  info: (msg: string, ctx?: LogContext) => logger.info(msg, ctx),
  warn: (msg: string, ctx?: LogContext) => logger.warn(msg, ctx),
  error: (msg: string, err?: Error | unknown, ctx?: LogContext) => logger.error(msg, err, ctx),
  success: (msg: string, ctx?: LogContext) => logger.success(msg, ctx),
  perf: (msg: string, duration: number, ctx?: LogContext) => logger.perf(msg, duration, ctx),
  api: (method: string, endpoint: string, status: number, duration?: number) => 
    logger.api(method, endpoint, status, duration),
  auth: (event: string, ctx?: LogContext) => logger.auth(event, ctx),
  db: (operation: string, duration?: number, ctx?: LogContext) => logger.db(operation, duration, ctx),
  cache: (operation: 'HIT' | 'MISS' | 'SET' | 'DELETE', key: string, ctx?: LogContext) => 
    logger.cache(operation, key, ctx),
};
