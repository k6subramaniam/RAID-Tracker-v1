// RAID Sync Integration
// Example of how to integrate sync features into RAIDMASTER

class RAIDSyncIntegration {
  constructor() {
    this.syncManager = window.syncManager;
    this.setupRAIDSync();
  }

  setupRAIDSync() {
    // Override save functions to use sync
    this.wrapSaveFunctions();
    
    // Setup auto-sync for critical data
    this.setupAutoSync();
    
    // Add sync status indicator to UI
    this.addSyncStatusIndicator();
  }

  // Wrap RAID save functions with sync capability
  wrapSaveFunctions() {
    // Example: Wrap the save function for RAID items
    const originalSaveRAID = window.saveRAIDItem || function() {};
    
    window.saveRAIDItem = async (raidItem) => {
      try {
        // Try to save online first
        if (navigator.onLine) {
          const result = await this.saveToAPI(raidItem);
          if (result.success) {
            // Save to local storage as backup
            this.saveToLocal(raidItem);
            return result;
          }
        }
        
        // If offline or online save failed, queue for sync
        const syncResult = await this.syncManager.queueForSync({
          type: 'raid-save',
          action: 'create',
          data: raidItem,
          timestamp: Date.now()
        });
        
        // Save to local storage
        this.saveToLocal(raidItem);
        
        // Notify user
        this.showSyncStatus('saved-offline');
        
        return {
          success: true,
          offline: true,
          syncId: syncResult.id
        };
      } catch (error) {
        console.error('Failed to save RAID item:', error);
        return {
          success: false,
          error: error.message
        };
      }
    };

    // Wrap update function
    const originalUpdateRAID = window.updateRAIDItem || function() {};
    
    window.updateRAIDItem = async (raidId, updates) => {
      try {
        if (navigator.onLine) {
          const result = await this.updateInAPI(raidId, updates);
          if (result.success) {
            this.updateLocal(raidId, updates);
            return result;
          }
        }
        
        // Queue for sync
        const syncResult = await this.syncManager.queueForSync({
          type: 'raid-update',
          action: 'update',
          raidId: raidId,
          data: updates,
          timestamp: Date.now()
        });
        
        // Update local storage
        this.updateLocal(raidId, updates);
        
        this.showSyncStatus('updated-offline');
        
        return {
          success: true,
          offline: true,
          syncId: syncResult.id
        };
      } catch (error) {
        console.error('Failed to update RAID item:', error);
        return {
          success: false,
          error: error.message
        };
      }
    };

    // Wrap delete function
    const originalDeleteRAID = window.deleteRAIDItem || function() {};
    
    window.deleteRAIDItem = async (raidId) => {
      try {
        if (navigator.onLine) {
          const result = await this.deleteFromAPI(raidId);
          if (result.success) {
            this.deleteFromLocal(raidId);
            return result;
          }
        }
        
        // Queue for sync
        const syncResult = await this.syncManager.queueForSync({
          type: 'raid-delete',
          action: 'delete',
          raidId: raidId,
          timestamp: Date.now()
        });
        
        // Mark as deleted in local storage
        this.markDeletedLocal(raidId);
        
        this.showSyncStatus('deleted-offline');
        
        return {
          success: true,
          offline: true,
          syncId: syncResult.id
        };
      } catch (error) {
        console.error('Failed to delete RAID item:', error);
        return {
          success: false,
          error: error.message
        };
      }
    };
  }

  // Setup automatic sync for critical data
  setupAutoSync() {
    // Auto-sync every 5 minutes when online
    setInterval(() => {
      if (navigator.onLine) {
        this.syncLocalChanges();
      }
    }, 5 * 60 * 1000);

    // Sync when coming back online
    window.addEventListener('online', () => {
      setTimeout(() => {
        this.syncLocalChanges();
      }, 2000); // Wait 2 seconds for connection to stabilize
    });

    // Request periodic sync for background updates
    if (this.syncManager.periodicSyncSupported) {
      this.syncManager.requestPeriodicSync();
    }
  }

  // Sync local changes with server
  async syncLocalChanges() {
    const localChanges = this.getLocalChanges();
    
    if (localChanges.length === 0) {
      console.log('No local changes to sync');
      return;
    }

    console.log(`Syncing ${localChanges.length} local changes...`);
    
    for (const change of localChanges) {
      try {
        let result;
        
        switch (change.action) {
          case 'create':
            result = await this.saveToAPI(change.data);
            break;
          case 'update':
            result = await this.updateInAPI(change.raidId, change.data);
            break;
          case 'delete':
            result = await this.deleteFromAPI(change.raidId);
            break;
        }
        
        if (result && result.success) {
          this.markSynced(change.id);
        }
      } catch (error) {
        console.error('Failed to sync change:', change, error);
      }
    }
    
    this.showSyncStatus('sync-complete');
  }

  // Add sync status indicator to UI
  addSyncStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'sync-status-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 8px 12px;
      border-radius: 20px;
      background: #10B981;
      color: white;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10000;
      transition: all 0.3s ease;
    `;
    
    indicator.innerHTML = `
      <span class="sync-icon">🔄</span>
      <span class="sync-text">Synced</span>
    `;
    
    document.body.appendChild(indicator);
    
    // Update indicator based on sync status
    setInterval(() => {
      this.updateSyncIndicator();
    }, 1000);
  }

  updateSyncIndicator() {
    const indicator = document.getElementById('sync-status-indicator');
    if (!indicator) return;
    
    const status = this.syncManager.getSyncStatus();
    const icon = indicator.querySelector('.sync-icon');
    const text = indicator.querySelector('.sync-text');
    
    if (!status.isOnline) {
      indicator.style.background = '#F59E0B';
      icon.textContent = '🔌';
      text.textContent = 'Offline';
    } else if (status.queueLength > 0) {
      indicator.style.background = '#3B82F6';
      icon.textContent = '🔄';
      icon.style.animation = 'spin 1s linear infinite';
      text.textContent = `Syncing (${status.queueLength})`;
    } else {
      indicator.style.background = '#10B981';
      icon.textContent = '✓';
      icon.style.animation = 'none';
      text.textContent = 'Synced';
    }
  }

  showSyncStatus(status) {
    const messages = {
      'saved-offline': 'Saved locally - will sync when online',
      'updated-offline': 'Updated locally - will sync when online',
      'deleted-offline': 'Deleted locally - will sync when online',
      'sync-complete': 'All changes synced successfully',
      'sync-failed': 'Sync failed - will retry later'
    };
    
    const message = messages[status] || 'Sync status updated';
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'raid-sync-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1F2937;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Local storage helpers
  saveToLocal(raidItem) {
    const items = JSON.parse(localStorage.getItem('raidItems') || '[]');
    items.push({
      ...raidItem,
      id: raidItem.id || Date.now().toString(),
      localSaved: true,
      syncPending: !navigator.onLine
    });
    localStorage.setItem('raidItems', JSON.stringify(items));
  }

  updateLocal(raidId, updates) {
    const items = JSON.parse(localStorage.getItem('raidItems') || '[]');
    const index = items.findIndex(item => item.id === raidId);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        localUpdated: true,
        syncPending: !navigator.onLine
      };
      localStorage.setItem('raidItems', JSON.stringify(items));
    }
  }

  deleteFromLocal(raidId) {
    const items = JSON.parse(localStorage.getItem('raidItems') || '[]');
    const filtered = items.filter(item => item.id !== raidId);
    localStorage.setItem('raidItems', JSON.stringify(filtered));
  }

  markDeletedLocal(raidId) {
    const items = JSON.parse(localStorage.getItem('raidItems') || '[]');
    const index = items.findIndex(item => item.id === raidId);
    if (index !== -1) {
      items[index].deleted = true;
      items[index].syncPending = !navigator.onLine;
      localStorage.setItem('raidItems', JSON.stringify(items));
    }
  }

  getLocalChanges() {
    const items = JSON.parse(localStorage.getItem('raidItems') || '[]');
    return items.filter(item => item.syncPending);
  }

  markSynced(changeId) {
    const items = JSON.parse(localStorage.getItem('raidItems') || '[]');
    const item = items.find(i => i.id === changeId);
    if (item) {
      item.syncPending = false;
      localStorage.setItem('raidItems', JSON.stringify(items));
    }
  }

  // API helpers (replace with actual API calls)
  async saveToAPI(raidItem) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id: Date.now().toString() });
      }, 1000);
    });
  }

  async updateInAPI(raidId, updates) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }

  async deleteFromAPI(raidId) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
}

// Initialize RAID sync integration
window.raidSyncIntegration = new RAIDSyncIntegration();

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
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
  
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);