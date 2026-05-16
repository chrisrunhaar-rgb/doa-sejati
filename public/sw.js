// Doa Sejati Service Worker
// Handles push notifications and offline caching

const CACHE_NAME = "doa-sejati-v1";
const OFFLINE_URLS = ["/today", "/", "/offline"];

// Install: cache critical pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and API calls
  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful navigation responses
        if (response.ok && event.request.mode === "navigate") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Return cached version on network failure
        return caches.match(event.request).then(
          (cached) => cached || caches.match("/today")
        );
      })
  );
});

// Push: display prayer notification
self.addEventListener("push", (event) => {
  let data = { title: "Doa Sejati", body: "Waktunya berdoa hari ini.", url: "/today" };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/logo.png",
      badge: "/icons/logo-badge.png",
      tag: "daily-prayer",
      renotify: true,
      requireInteraction: false,
      data: { url: data.url || "/today" },
      actions: [
        { action: "pray", title: "🙏 Berdoa Sekarang" },
        { action: "later", title: "Nanti" },
      ],
    })
  );
});

// Notification click: open the prayer page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "later") return;

  const baseUrl = event.notification.data?.url || "/today";
  const url = baseUrl + "?ref=push";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Push subscription change: update stored subscription
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: self.VAPID_PUBLIC_KEY,
    }).then((subscription) => {
      return fetch("/api/push/resubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });
    })
  );
});
