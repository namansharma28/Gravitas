// Custom Service Worker for Gravitas PWA
// This file extends the default next-pwa service worker

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueue());
  }
});

async function syncQueue() {
  try {
    // Get queued actions from IndexedDB
    const db = await openDatabase();
    const queue = await getQueuedActions(db);

    for (const action of queue) {
      try {
        // Attempt to sync the action
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          // Remove from queue on success
          await removeFromQueue(db, action.id);
        }
      } catch (error) {
        console.error('Error syncing action:', error);
        // Keep in queue for next sync attempt
      }
    }
  } catch (error) {
    console.error('Error in background sync:', error);
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gravitas-sync', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    };
  });
}

function getQueuedActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['queue'], 'readonly');
    const store = transaction.objectStore('queue');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeFromQueue(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['queue'], 'readwrite');
    const store = transaction.objectStore('queue');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cache management - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove old caches that don't match current version
          if (cacheName.includes('old-') || cacheName.includes('temp-')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    // Sync important content in the background
    const cache = await caches.open('api-cache');
    
    // Update cached API responses
    const urlsToSync = [
      '/api/events',
      '/api/communities',
      '/api/notifications',
    ];

    await Promise.all(
      urlsToSync.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.error(`Error syncing ${url}:`, error);
        }
      })
    );
  } catch (error) {
    console.error('Error in periodic sync:', error);
  }
}
