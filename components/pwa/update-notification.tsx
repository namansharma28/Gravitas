"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;

        setRegistration(reg);

        // Check for updates every hour
        const interval = setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000);

        // Listen for new service worker waiting
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdate(true);
            }
          });
        });

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    checkForUpdates();
  }, []);

  const handleUpdate = () => {
    if (!registration?.waiting) return;

    // Tell the service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page when the new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-background border rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Update Available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              A new version of Gravitas is available. Update now for the latest features and improvements.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleUpdate}>
                Update Now
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowUpdate(false)}>
                Later
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setShowUpdate(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
