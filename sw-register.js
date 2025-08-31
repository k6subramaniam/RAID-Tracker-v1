// Service Worker Registration Script for RAIDMASTER
// This ensures proper registration with PWABuilder requirements

(function() {
  'use strict';

  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
    
    // Wait for the window to load
    window.addEventListener('load', function() {
      
      // Register the service worker
      navigator.serviceWorker.register('/pwabuilder-sw.js', {
        scope: '/'
      })
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
        
        // Check for updates regularly
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
        
        // Handle updates
        registration.addEventListener('updatefound', function() {
          const newWorker = registration.installing;
          console.log('New service worker installing...');
          
          newWorker.addEventListener('statechange', function() {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log('New content available; please refresh.');
                showUpdateNotification();
              } else {
                // Content cached for offline use
                console.log('Content cached for offline use!');
                showOfflineReadyNotification();
              }
            }
          });
        });
        
        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', function() {
          window.location.reload();
        });
        
      })
      .catch(function(error) {
        console.error('ServiceWorker registration failed:', error);
      });
      
      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', function(event) {
        console.log('Message from service worker:', event.data);
      });
      
    });
    
  } else {
    console.log('Service workers are not supported in this browser.');
  }
  
  // Helper functions for notifications
  function showUpdateNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('RAIDMASTER Update', {
        body: 'A new version is available. Refresh to update.',
        icon: '/icon-192.png',
        badge: '/icon-72.png'
      });
    }
  }
  
  function showOfflineReadyNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('RAIDMASTER Ready', {
        body: 'App is ready for offline use!',
        icon: '/icon-192.png',
        badge: '/icon-72.png'
      });
    }
  }
  
  // Request notification permission if not already granted
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(function(permission) {
      console.log('Notification permission:', permission);
    });
  }
  
})();

// Also handle app install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', function(event) {
  // Prevent the mini-infobar from appearing on mobile
  event.preventDefault();
  // Save the event for later use
  deferredPrompt = event;
  // Update UI to show install button
  console.log('App can be installed');
  showInstallButton();
});

window.addEventListener('appinstalled', function(event) {
  console.log('RAIDMASTER was installed');
  deferredPrompt = null;
});

function showInstallButton() {
  // This function would show an install button in your UI
  // For now, just log it
  console.log('Show install button in UI');
}

// Export for use in other scripts
window.installApp = function() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(choiceResult) {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  }
};