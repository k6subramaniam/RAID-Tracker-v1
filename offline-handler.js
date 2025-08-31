// Offline Handler for RAIDMASTER
// This manages offline functionality and AI feature availability

class OfflineHandler {
  constructor() {
    this.isOnline = navigator.onLine;
    this.aiAvailable = false;
    this.setupEventListeners();
    this.checkConnection();
  }

  setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Check connection periodically
    setInterval(() => this.checkConnection(), 30000); // Every 30 seconds
  }

  handleOnline() {
    this.isOnline = true;
    this.aiAvailable = true;
    this.showNotification('Back online! All features available.');
    this.syncPendingData();
  }

  handleOffline() {
    this.isOnline = false;
    this.aiAvailable = false;
    this.showNotification('Offline mode - AI features unavailable. All other features work normally.');
  }

  checkConnection() {
    // Try to ping a reliable endpoint
    fetch('https://www.google.com/favicon.ico', { 
      mode: 'no-cors',
      cache: 'no-cache' 
    })
    .then(() => {
      if (!this.isOnline) {
        this.handleOnline();
      }
    })
    .catch(() => {
      if (this.isOnline) {
        this.handleOffline();
      }
    });
  }

  showNotification(message) {
    // Show notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('RAIDMASTER', {
        body: message,
        icon: '/icon-192.png'
      });
    } else {
      // Fallback to console or UI notification
      console.log('RAIDMASTER:', message);
      this.showUINotification(message);
    }
  }

  showUINotification(message) {
    // Create a toast notification in the UI
    const toast = document.createElement('div');
    toast.className = 'offline-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${this.isOnline ? '#10B981' : '#F59E0B'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  syncPendingData() {
    // Sync any data that was saved while offline
    const pendingData = localStorage.getItem('pendingSync');
    if (pendingData) {
      try {
        const data = JSON.parse(pendingData);
        // Process pending data
        console.log('Syncing pending data:', data);
        localStorage.removeItem('pendingSync');
      } catch (error) {
        console.error('Error syncing data:', error);
      }
    }
  }

  // Check if AI features can be used
  canUseAI() {
    return this.isOnline && this.aiAvailable;
  }

  // Wrapper for AI API calls
  async callAI(endpoint, data) {
    if (!this.canUseAI()) {
      return {
        error: true,
        message: 'AI features require internet connection',
        offline: true
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('AI API call failed');
      }

      return await response.json();
    } catch (error) {
      this.aiAvailable = false;
      return {
        error: true,
        message: 'AI service unavailable',
        details: error.message
      };
    }
  }

  // Save data for offline use
  saveOfflineData(key, data) {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
      return true;
    } catch (error) {
      console.error('Error saving offline data:', error);
      return false;
    }
  }

  // Get offline data
  getOfflineData(key) {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error retrieving offline data:', error);
    }
    return null;
  }
}

// Initialize offline handler when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.offlineHandler = new OfflineHandler();
  });
} else {
  window.offlineHandler = new OfflineHandler();
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);