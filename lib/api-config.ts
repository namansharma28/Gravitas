// API configuration for Capacitor
// This ensures API calls work in both web and native apps

export const getApiUrl = (path: string): string => {
  // Check if running in Capacitor (native app)
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.gravitas.page';
    return `${baseUrl}${path}`;
  }
  
  // For web, use relative URLs
  return path;
};

// Custom fetch wrapper that automatically handles API URLs
export const apiFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? getApiUrl(input) : input;
  return fetch(url, init);
};
