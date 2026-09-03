// Service Worker for Mujtahid Academy
// Version 1.0.0

const CACHE_NAME = 'mujtahid-v1.1.0';
const STATIC_CACHE = 'mujtahid-static-v1.1.0';
const DYNAMIC_CACHE = 'mujtahid-dynamic-v1.1.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/qudrat.html',
    '/tahsili.html',
    '/step.html',
    '/styles.css',
    '/images/logo1.svg',
    '/images/homepage.jpg',
    '/manifest.json'
];

// Files to cache on demand
const CACHE_STRATEGIES = {
    // Cache first for static assets
    static: [
        '/images/',
        '/fonts/',
        '/css/',
        '/js/'
    ],
    // Network first for HTML pages
    pages: [
        '.html'
    ],
    // Stale while revalidate for API calls
    api: [
        '/api/'
    ]
};

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests (except fonts and CDN)
    if (url.origin !== location.origin && 
        !url.hostname.includes('fonts.googleapis.com') &&
        !url.hostname.includes('fonts.gstatic.com') &&
        !url.hostname.includes('cdnjs.cloudflare.com')) {
        return;
    }
    
    event.respondWith(handleRequest(request));
});

// Handle different types of requests
async function handleRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
        // Strategy 1: Cache First (for static assets)
        if (isStaticAsset(pathname)) {
            return await cacheFirst(request);
        }
        
        // Strategy 2: Network First (for HTML pages)
        if (isHTMLPage(pathname)) {
            return await networkFirst(request);
        }
        
        // Strategy 3: Stale While Revalidate (for API calls)
        if (isAPICall(pathname)) {
            return await staleWhileRevalidate(request);
        }
        
        // Default: Network First
        return await networkFirst(request);
        
    } catch (error) {
        console.error('Service Worker: Error handling request', error);
        return await handleOffline(request);
    }
}

// Cache First Strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Network error in cacheFirst', error);
        throw error;
    }
}

// Network First Strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache');
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const networkResponsePromise = fetch(request)
        .then(response => {
            if (response.ok) {
                const cache = caches.open(DYNAMIC_CACHE);
                cache.then(c => c.put(request, response.clone()));
            }
            return response;
        })
        .catch(error => {
            console.error('Service Worker: Network error in staleWhileRevalidate', error);
        });
    
    return cachedResponse || networkResponsePromise;
}

// Handle offline scenarios
async function handleOffline(request) {
    const url = new URL(request.url);
    
    // Return cached page if available
    if (request.destination === 'document') {
        const cachedResponse = await caches.match('/index.html');
        if (cachedResponse) {
            return cachedResponse;
        }
    }
    
    // Return cached image if available
    if (request.destination === 'image') {
        const cachedResponse = await caches.match('/images/logo1.svg');
        if (cachedResponse) {
            return cachedResponse;
        }
    }
    
    // Return generic offline response
    return new Response('Offline - المحتوى غير متوفر حالياً', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    });
}

// Helper functions
function isStaticAsset(pathname) {
    return CACHE_STRATEGIES.static.some(pattern => pathname.includes(pattern)) ||
           pathname.includes('.css') ||
           pathname.includes('.js') ||
           pathname.includes('.png') ||
           pathname.includes('.jpg') ||
           pathname.includes('.jpeg') ||
           pathname.includes('.gif') ||
           pathname.includes('.svg') ||
           pathname.includes('.woff') ||
           pathname.includes('.woff2');
}

function isHTMLPage(pathname) {
    return pathname.endsWith('.html') || pathname === '/';
}

function isAPICall(pathname) {
    return CACHE_STRATEGIES.api.some(pattern => pathname.includes(pattern));
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Handle any offline actions that need to be synced
    console.log('Service Worker: Background sync triggered');
}

// Push notifications (if needed in future)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: '/images/logo1.svg',
            badge: '/images/logo1.svg',
            data: data.url
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.notification.data) {
        event.waitUntil(
            clients.openWindow(event.notification.data)
        );
    }
});

// Performance monitoring
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({ cacheSize: size });
        });
    }
});

async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}
