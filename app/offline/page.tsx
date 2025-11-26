"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  if (isOnline) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <RefreshCw className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Back Online!</CardTitle>
            <CardDescription>
              Your connection has been restored
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <WifiOff className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
          <CardTitle>You're Offline</CardTitle>
          <CardDescription>
            It looks like you've lost your internet connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="mb-2 font-medium">What you can do:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Check your internet connection</li>
              <li>• Try again in a few moments</li>
              <li>• View cached content from your recent visits</li>
            </ul>
          </div>

          <Button onClick={handleRetry} className="w-full" disabled={!isOnline}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <div className="grid grid-cols-3 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/calendar">
                <Calendar className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/communities">
                <Users className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Some features may be available offline from your cache
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
