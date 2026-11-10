// CYT service worker: push notifications + an offline page for the installed app.
// It does NOT cache site pages or data (Next.js handles that) — only /offline.html and its icon,
// shown when a page can't load because the phone is offline.
var OFFLINE_CACHE = 'cyt-offline-v1';
var OFFLINE_URL = '/offline.html';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then(function (cache) {
      return cache.addAll([OFFLINE_URL, '/icons/cyt-icon-192.png']);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('cyt-offline-') === 0 && k !== OFFLINE_CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// page loads only: try the network; if that fails (offline), show the offline page
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.mode !== 'navigate' || req.method !== 'GET') return;
  event.respondWith(
    fetch(req).catch(function () {
      return caches.open(OFFLINE_CACHE).then(function (cache) { return cache.match(OFFLINE_URL); });
    })
  );
});

self.addEventListener('push', function (event) {
  let data = { title: 'Notification', body: 'New Message from Choose Your Therapist' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Notification', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/cyt-icon-192.png',
    badge: '/favicon.png',
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === event.notification.data && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data);
      }
    })
  );
});
