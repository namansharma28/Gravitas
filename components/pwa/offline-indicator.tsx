"use client";

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showOffline, setShowOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
      setShowBackOnline(false);
    } else if (showOffline) {
      // User came back online
      setShowOffline(false);
      setShowBackOnline(true);
      
      // Hide the "back online" message after 3 seconds
      const timer = setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, showOffline]);

  if (showBackOnline) {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
        <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back online</span>
        </div>
      </div>
    );
  }

  if (!showOffline) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
      <div className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">You&apos;re offline</span>
      </div>
    </div>
  );
}
