"use client";

import { useState, useEffect } from 'react';

// Background sync for offline actions
// Queues actions when offline and syncs when back online

interface SyncAction {
  id: string;
  type: 'follow' | 'rsvp' | 'like' | 'comment' | 'update';
  endpoint: string;
  method: string;
  body?: any;
  timestamp: number;
  retries: number;
}

class BackgroundSync {
  private queue: SyncAction[] = [];
  private maxRetries = 3;
  private storageKey = 'gravitas-sync-queue';

  constructor() {
    // Load queue from localStorage
    this.loadQueue();

    // Listen for online event
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
    }

    // Register service worker sync if available
    this.registerSync();
  }

  /**
   * Add action to sync queue
   */
  async addToQueue(action: Omit<SyncAction, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const syncAction: SyncAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(syncAction);
    this.saveQueue();

    console.log('📥 Action queued for sync:', syncAction.type);

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.processQueue();
    }
  }

  /**
   * Process sync queue
   */
  async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    console.log('🔄 Processing sync queue:', this.queue.length, 'items');

    const failedActions: SyncAction[] = [];

    for (const action of this.queue) {
      try {
        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: action.body ? JSON.stringify(action.body) : undefined,
        });

        if (response.ok) {
          console.log('✅ Synced:', action.type, action.endpoint);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Sync failed:', action.type, error);
        
        action.retries++;
        if (action.retries < this.maxRetries) {
          failedActions.push(action);
        } else {
          console.error('🚫 Max retries reached, dropping action:', action.type);
        }
      }
    }

    // Update queue with failed actions
    this.queue = failedActions;
    this.saveQueue();

    if (this.queue.length === 0) {
      console.log('✨ All actions synced successfully!');
    } else {
      console.log('⚠️ Some actions failed, will retry later');
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      pending: this.queue.length,
      actions: this.queue.map(a => ({
        type: a.type,
        timestamp: new Date(a.timestamp).toISOString(),
        retries: a.retries,
      })),
    };
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log('📦 Loaded sync queue:', this.queue.length, 'items');
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.queue = [];
    }
  }

  /**
   * Register service worker sync
   */
  private async registerSync(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Check if sync is supported
        if ('sync' in registration) {
          await (registration as any).sync.register('sync-actions');
          console.log('✅ Background sync registered');
        }
      } catch (error) {
        console.error('❌ Background sync registration failed:', error);
      }
    }
  }
}

// Export singleton instance
export const backgroundSync = new BackgroundSync();

/**
 * Hook for using background sync
 */
export function useBackgroundSync() {
  const [queueStatus, setQueueStatus] = useState(backgroundSync.getQueueStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setQueueStatus(backgroundSync.getQueueStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    addToQueue: (action: Omit<SyncAction, 'id' | 'timestamp' | 'retries'>) => 
      backgroundSync.addToQueue(action),
    processQueue: () => backgroundSync.processQueue(),
    clearQueue: () => backgroundSync.clearQueue(),
    queueStatus,
  };
}

/**
 * Wrapper for API calls with offline support
 */
export async function fetchWithSync(
  endpoint: string,
  options: RequestInit = {},
  syncType?: SyncAction['type']
): Promise<Response> {
  try {
    const response = await fetch(endpoint, options);
    return response;
  } catch (error) {
    // If offline and sync type provided, queue the action
    if (!navigator.onLine && syncType && options.method !== 'GET') {
      await backgroundSync.addToQueue({
        type: syncType,
        endpoint,
        method: options.method || 'GET',
        body: options.body,
      });

      // Return a fake success response
      return new Response(
        JSON.stringify({ 
          queued: true, 
          message: 'Action queued for sync when online' 
        }),
        { 
          status: 202, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    throw error;
  }
}
