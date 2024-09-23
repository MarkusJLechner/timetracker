// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open('time-tracker-cache').then((cache) => {
//       return cache.addAll([
//         '/',
//         '/index.html',
//         '/android-chrome-192x192.png',
//         '/android-chrome-512x512.png',
//         '/favicon.ico'
//       ]);
//     })
//   );
// });
//
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });

self.addEventListener('install', () => {})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
