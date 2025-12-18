const CACHE_NAME = 'watchful-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/folder.html',
    '/day.html',
    '/styles.css',
    '/storage.js',
    '/pdf-export.js',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});