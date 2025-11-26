"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { usePWA } from '@/hooks/use-pwa';
import { getCacheStats, clearAllCaches, formatBytes } from '@/lib/pwa-cache';
import { Download, Trash2, HardDrive, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PWASettingsPage() {
  const { isInstalled, isOnline, install } = usePWA();
  const [cacheStats, setCacheStats] = useState<Awaited<ReturnType<typeof getCacheStats>>>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    const stats = await getCacheStats();
    setCacheStats(stats);
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const success = await clearAllCaches();
      if (success) {
        toast({
          title: 'Cache Cleared',
          description: 'All cached data has been removed.',
        });
        await loadCacheStats();
      } else {
        throw new Error('Failed to clear cache');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear cache.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          toast({
            title: 'Cache Updated',
            description: 'Service worker has been updated.',
          });
        }
      }
      await loadCacheStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh cache.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalCacheSize = cacheStats.reduce((acc, stat) => acc + stat.size, 0);
  const totalCacheItems = cacheStats.reduce((acc, stat) => acc + stat.count, 0);

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">PWA Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your Progressive Web App settings and offline capabilities
        </p>
      </div>

      {/* Installation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            App Installation
          </CardTitle>
          <CardDescription>
            Install Gravitas as a standalone app on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {isInstalled ? 'App Installed' : 'Not Installed'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isInstalled
                  ? 'Gravitas is installed on your device'
                  : 'Install Gravitas for a better experience'}
              </p>
            </div>
            {!isInstalled && (
              <Button onClick={install}>
                Install App
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-500" />
            )}
            Connection Status
          </CardTitle>
          <CardDescription>
            Your current network connection status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-orange-500'
              }`}
            />
            <p className="font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isOnline
              ? 'You are connected to the internet'
              : 'You are offline. Some features may be limited.'}
          </p>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Cache Storage
          </CardTitle>
          <CardDescription>
            Manage cached data for offline access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Size</p>
              <p className="text-2xl font-bold">{formatBytes(totalCacheSize)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Cached Items</p>
              <p className="text-2xl font-bold">{totalCacheItems}</p>
            </div>
          </div>

          {cacheStats.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Cache Details</p>
              {cacheStats.map((stat) => (
                <div
                  key={stat.name}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{stat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.count} items
                    </p>
                  </div>
                  <p className="text-sm">{formatBytes(stat.size)}</p>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefreshCache}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Cache
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearCache}
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Cache
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Clearing cache will remove all offline data. The app will re-cache content as you use it.
          </p>
        </CardContent>
      </Card>

      {/* Offline Features */}
      <Card>
        <CardHeader>
          <CardTitle>Offline Features</CardTitle>
          <CardDescription>
            What works when you&apos;re offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>View previously loaded pages and content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Queue actions to sync when back online</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Access cached images and assets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">⚠</span>
              <span>Limited functionality for real-time features</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
