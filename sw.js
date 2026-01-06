// WebSlider Service Worker
// Intercepts requests to /webslider-cache/* and serves from Cache Storage

const CACHE_NAME = 'webslider-assets-v1';
const CACHE_PREFIX = '/webslider-cache/';

// Comprehensive MIME type mapping
const MIME_TYPES = {
    // Core web documents
    'html': 'text/html; charset=utf-8',
    'htm': 'text/html; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'js': 'text/javascript; charset=utf-8',
    'mjs': 'text/javascript; charset=utf-8',
    'cjs': 'text/javascript; charset=utf-8',
    'json': 'application/json; charset=utf-8',
    'map': 'application/json; charset=utf-8',
    'xml': 'application/xml; charset=utf-8',
    'txt': 'text/plain; charset=utf-8',
    'csv': 'text/csv; charset=utf-8',
    'md': 'text/markdown; charset=utf-8',
    'yaml': 'application/yaml; charset=utf-8',
    'yml': 'application/yaml; charset=utf-8',
    'toml': 'application/toml; charset=utf-8',
    'webmanifest': 'application/manifest+json; charset=utf-8',
    
    // Images
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'avif': 'image/avif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'bmp': 'image/bmp',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
    
    // Fonts
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'otf': 'font/otf',
    'eot': 'application/vnd.ms-fontobject',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'opus': 'audio/opus',
    'aac': 'audio/aac',
    'm4a': 'audio/mp4',
    'flac': 'audio/flac',
    
    // Video
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogv': 'video/ogg',
    'mov': 'video/quicktime',
    'm4v': 'video/mp4',
    'mpeg': 'video/mpeg',
    'mpg': 'video/mpeg',
    
    // Data / binaries / 3D / WASM
    'wasm': 'application/wasm',
    'bin': 'application/octet-stream',
    'glb': 'model/gltf-binary',
    'gltf': 'model/gltf+json',
    'obj': 'text/plain; charset=utf-8',
    'stl': 'model/stl',
    'dae': 'model/vnd.collada+xml',
    
    // Documents
    'pdf': 'application/pdf',
    'rtf': 'application/rtf',
    
    // Archives
    'zip': 'application/zip',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    'tgz': 'application/gzip',
    '7z': 'application/x-7z-compressed',
    'rar': 'application/vnd.rar'
};

function getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

// Install event
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker');
    event.waitUntil(clients.claim());
});

// Fetch event - intercept requests to /webslider-cache/*
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Only intercept requests to our cache prefix
    if (!url.pathname.startsWith(CACHE_PREFIX)) {
        return; // Let browser handle normally
    }
    
    console.log('[SW] Intercepting:', url.pathname);
    
    event.respondWith(
        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                
                // Try to find the exact URL in cache
                let response = await cache.match(event.request);
                
                if (response) {
                    console.log('[SW] Cache hit:', url.pathname);
                    return response;
                }
                
                // Try with the full URL (absolute)
                response = await cache.match(url.href);
                
                if (response) {
                    console.log('[SW] Cache hit (absolute):', url.href);
                    return response;
                }
                
                // Not found in cache
                console.log('[SW] Cache miss:', url.pathname);
                
                return new Response('Not Found in WebSlider Cache', {
                    status: 404,
                    statusText: 'Not Found',
                    headers: { 'Content-Type': 'text/plain' }
                });
            } catch (error) {
                console.error('[SW] Error:', error);
                return new Response('Service Worker Error: ' + error.message, {
                    status: 500,
                    statusText: 'Internal Error',
                    headers: { 'Content-Type': 'text/plain' }
                });
            }
        })()
    );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data.type === 'CLEAR_CACHE') {
        console.log('[SW] Clearing cache');
        caches.delete(CACHE_NAME).then(() => {
            event.ports[0].postMessage({ success: true });
        }).catch((error) => {
            event.ports[0].postMessage({ success: false, error: error.message });
        });
    }
});
