// Sync Manager for RAIDMASTER
// Handles background sync and periodic sync functionality

class SyncManager {
  constructor() {
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
    this.checkSyncSupport();
  }

  setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Listen for messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
    }
  }

  checkSyncSupport() {
    // Check for Background Sync API support
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      this.backgroundSyncSupported = true;
      console.log('Background Sync API supported');
    } else {
      this.backgroundSyncSupported = false;
      console.log('Background Sync API not supported');
    }

    // Check for Periodic Sync API support
    if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
      this.periodicSyncSupported = true;
      this.checkPeriodicSyncPermission();
    } else {
      this.periodicSyncSupported = false;
      console.log('Periodic Sync API not supported');
    }
  }

  async checkPeriodicSyncPermission() {
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync',
    }).catch(() => null);

    if (status) {
      this.periodicSyncPermission = status.state;
      status.addEventListener('change', () => {
        this.periodicSyncPermission = status.state;
        console.log('Periodic sync permission:', status.state);
      });
    }
  }

  // Queue data for sync when offline
  async queueForSync(data) {
    const syncItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      data: data,
      type: data.type || 'raid-update',
      retries: 0
    };

    // Store in localStorage as backup
    this.syncQueue.push(syncItem);
    this.saveQueueToStorage();

    // Register for background sync if supported
    if (this.backgroundSyncSupported) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('raid-sync');
        console.log('Queued for background sync:', syncItem);
        return { success: true, queued: true, id: syncItem.id };
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }

    // Fallback: try to sync when back online
    return { success: true, queued: true, id: syncItem.id, fallback: true };
  }

  // Save queue to localStorage
  saveQueueToStorage() {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  // Load queue from localStorage
  loadQueueFromStorage() {
    try {
      const stored = localStorage.getItem('syncQueue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  // Handle coming back online
  async handleOnline() {
    this.isOnline = true;
    console.log('Back online - processing sync queue');
    
    // Process queued items
    if (this.syncQueue.length > 0) {
      await this.processSyncQueue();
    }

    // Notify user
    this.showNotification('Connection restored', 'Syncing your changes...');
  }

  // Handle going offline
  handleOffline() {
    this.isOnline = false;
    console.log('Gone offline - enabling queue mode');
    this.showNotification('Working offline', 'Your changes will sync when connection returns');
  }

  // Process sync queue
  async processSyncQueue() {
    const queue = [...this.syncQueue];
    const processed = [];

    for (const item of queue) {
      try {
        const success = await this.syncItem(item);
        if (success) {
          processed.push(item.id);
        } else if (item.retries < 3) {
          item.retries++;
        } else {
          // Max retries reached, remove from queue
          processed.push(item.id);
          console.error('Max retries reached for sync item:', item);
        }
      } catch (error) {
        console.error('Failed to sync item:', item, error);
        if (item.retries < 3) {
          item.retries++;
        } else {
          processed.push(item.id);
        }
      }
    }

    // Remove processed items
    this.syncQueue = this.syncQueue.filter(item => !processed.includes(item.id));
    this.saveQueueToStorage();

    if (processed.length > 0) {
      this.showNotification('Sync complete', `${processed.length} changes synced successfully`);
    }
  }

  // Sync individual item
  async syncItem(item) {
    // This would be your actual API call
    // For now, we'll simulate it
    console.log('Syncing item:', item);
    
    // Example: Send to your API
    /*
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data)
    });
    
    return response.ok;
    */
    
    // Simulate successful sync
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1000);
    });
  }

  // Handle messages from service worker
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'sync-complete':
        console.log('Background sync completed at:', new Date(data.timestamp));
        this.loadQueueFromStorage();
        break;
      case 'periodic-sync-complete':
        console.log('Periodic sync completed at:', new Date(data.timestamp));
        break;
      default:
        console.log('Service worker message:', data);
    }
  }

  // Request periodic sync permission
  async requestPeriodicSync() {
    if (!this.periodicSyncSupported) {
      console.log('Periodic sync not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const status = await registration.periodicSync.register('raid-periodic-sync', {
        minInterval: 12 * 60 * 60 * 1000 // 12 hours
      });
      console.log('Periodic sync registered');
      return true;
    } catch (error) {
      console.error('Failed to register periodic sync:', error);
      return false;
    }
  }

  // Show notification to user
  showNotification(title, message) {
    // Try browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icon-192.png',
        badge: '/icon-72.png'
      });
    }

    // Also show in-app notification
    const toast = document.createElement('div');
    toast.className = 'sync-toast';
    toast.innerHTML = `
      <strong>${title}</strong>
      <span>${message}</span>
    `;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${this.isOnline ? '#10B981' : '#F59E0B'};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      backgroundSyncSupported: this.backgroundSyncSupported,
      periodicSyncSupported: this.periodicSyncSupported,
      periodicSyncPermission: this.periodicSyncPermission
    };
  }
}

// Initialize sync manager
window.syncManager = new SyncManager();

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .sync-toast strong {
    display: block;
    margin-bottom: 4px;
  }
`;
document.head.appendChild(style);

// Export for use in other modules
export default SyncManager;