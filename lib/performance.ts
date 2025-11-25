// Performance monitoring utilities

export class PerformanceMonitor {
  private marks: Map<string, number>;

  constructor() {
    this.marks = new Map();
  }

  // Start timing an operation
  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  // End timing and return duration
  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);
    return duration;
  }

  // End timing and log to console
  endAndLog(label: string): number {
    const duration = this.end(label);
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  // Measure a function execution time
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.endAndLog(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

// Export singleton instance
export const perfMonitor = new PerformanceMonitor();

// API response time tracking
export function trackAPICall(endpoint: string, duration: number): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 API ${endpoint}: ${duration.toFixed(2)}ms`);
  }

  // In production, you could send this to an analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'api_timing', {
      event_category: 'API',
      event_label: endpoint,
      value: Math.round(duration),
    });
  }
}

// Image load tracking
export function trackImageLoad(src: string, duration: number, size?: number): void {
  if (process.env.NODE_ENV === 'development') {
    const sizeStr = size ? ` (${formatBytes(size)})` : '';
    console.log(`🖼️ Image loaded${sizeStr}: ${duration.toFixed(2)}ms - ${src}`);
  }
}

// Helper to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Web Vitals tracking
export function reportWebVitals(metric: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${metric.name}:`, metric.value);
  }

  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

// Database query performance tracking
export async function trackDBQuery<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await query();
    const duration = Date.now() - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🗄️ DB Query ${queryName}: ${duration}ms`);
    }
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`⚠️ Slow query detected: ${queryName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ DB Query ${queryName} failed after ${duration}ms:`, error);
    throw error;
  }
}
