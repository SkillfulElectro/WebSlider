const PRESET_SIZES = [
    { name: 'PowerPoint 16:9', width: 1280, height: 720 },
    { name: 'PowerPoint 4:3', width: 1024, height: 768 },
    { name: 'A4 Portrait', width: 794, height: 1123 },
    { name: 'A4 Landscape', width: 1123, height: 794 },
    { name: 'Letter Portrait', width: 816, height: 1056 },
    { name: 'Letter Landscape', width: 1056, height: 816 },
    { name: 'HD 1080p', width: 1920, height: 1080 },
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Custom', width: 800, height: 600 }
];

const CACHE_NAME = 'webslider-assets-v1';
const CACHE_PREFIX = '/webslider-cache/';
const STORAGE_KEY = 'webslider_project';

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

// ===== SERVICE WORKER REGISTRATION =====
const ServiceWorkerManager = {
    registration: null,
    ready: false,
    
    async register() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported');
            return false;
        }
        
        try {
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            console.log('[Main] Service Worker registered:', this.registration.scope);
            
            // Wait for the SW to be ready
            await navigator.serviceWorker.ready;
            this.ready = true;
            console.log('[Main] Service Worker ready');
            
            return true;
        } catch (error) {
            console.error('[Main] Service Worker registration failed:', error);
            return false;
        }
    },
    
    async clearCacheViaSW() {
        if (!navigator.serviceWorker.controller) {
            // Fallback to direct cache clear
            return CacheManager.clear();
        }
        
        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data.success);
            };
            navigator.serviceWorker.controller.postMessage(
                { type: 'CLEAR_CACHE' },
                [messageChannel.port2]
            );
        });
    }
};

// ===== TAR UTILITIES =====
const Tar = {
    create(files) {
        const blocks = [];
        
        for (const file of files) {
            const content = file.isText 
                ? new TextEncoder().encode(file.content) 
                : file.content;
            
            const header = new Uint8Array(512);
            const nameBytes = new TextEncoder().encode(file.name.substring(0, 99));
            header.set(nameBytes, 0);
            header.set(new TextEncoder().encode('0000644\0'), 100);
            header.set(new TextEncoder().encode('0000000\0'), 108);
            header.set(new TextEncoder().encode('0000000\0'), 116);
            
            const sizeOctal = content.length.toString(8).padStart(11, '0') + '\0';
            header.set(new TextEncoder().encode(sizeOctal), 124);
            
            const mtime = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + '\0';
            header.set(new TextEncoder().encode(mtime), 136);
            header.set(new TextEncoder().encode('        '), 148);
            header[156] = 48;
            
            let checksum = 0;
            for (let i = 0; i < 512; i++) checksum += header[i];
            const checksumStr = checksum.toString(8).padStart(6, '0') + '\0 ';
            header.set(new TextEncoder().encode(checksumStr), 148);
            
            blocks.push(header);
            blocks.push(content);
            
            const padding = (512 - (content.length % 512)) % 512;
            if (padding > 0) blocks.push(new Uint8Array(padding));
        }
        
        blocks.push(new Uint8Array(1024));
        
        const totalSize = blocks.reduce((sum, b) => sum + b.length, 0);
        const result = new Uint8Array(totalSize);
        let offset = 0;
        for (const block of blocks) {
            result.set(block, offset);
            offset += block.length;
        }
        return result;
    },
    
    parse(buffer) {
        const data = new Uint8Array(buffer);
        const files = [];
        let offset = 0;
        
        while (offset < data.length - 512) {
            const header = data.slice(offset, offset + 512);
            if (header.every(b => b === 0)) break;
            
            let nameEnd = 0;
            while (nameEnd < 100 && header[nameEnd] !== 0) nameEnd++;
            const name = new TextDecoder().decode(header.slice(0, nameEnd));
            
            let sizeStr = new TextDecoder().decode(header.slice(124, 135)).trim();
            const size = parseInt(sizeStr, 8) || 0;
            const typeFlag = header[156];
            
            offset += 512;
            
            if (size > 0 && (typeFlag === 48 || typeFlag === 0)) {
                const content = data.slice(offset, offset + size);
                files.push({ name, content: new Uint8Array(content) });
                offset += size;
                const padding = (512 - (size % 512)) % 512;
                offset += padding;
            }
        }
        return files;
    }
};

// ===== CACHE MANAGER =====
const CacheManager = {
    async clear() {
        try {
            await caches.delete(CACHE_NAME);
            console.log('[Cache] Cleared');
        } catch (e) {
            console.warn('[Cache] Failed to clear:', e);
        }
    },
    
    async storeFile(slideIndex, path, content, contentType) {
        try {
            const cache = await caches.open(CACHE_NAME);
            // Normalize path: remove leading ./ or /
            const normalizedPath = path.replace(/^\.?\//, '');
            const url = `${CACHE_PREFIX}${slideIndex}/${normalizedPath}`;
            
            // Determine content type if not provided
            if (!contentType) {
                contentType = this.getMimeType(normalizedPath);
            }
            
            const response = new Response(content, { 
                headers: { 'Content-Type': contentType }
            });
            await cache.put(url, response);
            console.log('[Cache] Stored:', url, '(' + contentType + ')');
            return url;
        } catch (e) {
            console.error('[Cache] Failed to store:', path, e);
        }
    },
    
    async getFile(slideIndex, path) {
        try {
            const cache = await caches.open(CACHE_NAME);
            const normalizedPath = path.replace(/^\.?\//, '');
            const url = `${CACHE_PREFIX}${slideIndex}/${normalizedPath}`;
            const response = await cache.match(url);
            if (response) {
                console.log('[Cache] Hit:', url);
            } else {
                console.log('[Cache] Miss:', url);
            }
            return response;
        } catch (e) {
            console.warn('[Cache] Failed to get:', path, e);
            return null;
        }
    },
    
    async getAllFilesForSlide(slideIndex) {
        try {
            const cache = await caches.open(CACHE_NAME);
            const keys = await cache.keys();
            const prefix = `${CACHE_PREFIX}${slideIndex}/`;
            const files = [];
            
            for (const request of keys) {
                const url = new URL(request.url);
                if (url.pathname.startsWith(prefix)) {
                    const response = await cache.match(request);
                    if (response) {
                        const content = await response.arrayBuffer();
                        files.push({
                            path: url.pathname.substring(prefix.length),
                            content: new Uint8Array(content),
                            contentType: response.headers.get('Content-Type')
                        });
                    }
                }
            }
            console.log(`[Cache] Found ${files.length} files for slide ${slideIndex}`);
            return files;
        } catch (e) {
            console.warn('[Cache] Failed to get files:', e);
            return [];
        }
    },
    
    async deleteSlideAssets(slideIndex) {
        try {
            const cache = await caches.open(CACHE_NAME);
            const keys = await cache.keys();
            const prefix = `${CACHE_PREFIX}${slideIndex}/`;
            
            for (const request of keys) {
                const url = new URL(request.url);
                if (url.pathname.startsWith(prefix)) {
                    await cache.delete(request);
                }
            }
            console.log(`[Cache] Deleted assets for slide ${slideIndex}`);
        } catch (e) {
            console.warn('[Cache] Failed to delete slide assets:', e);
        }
    },
    
    async renumberSlides(oldIndex, newIndex) {
        const files = await this.getAllFilesForSlide(oldIndex);
        await this.deleteSlideAssets(oldIndex);
        for (const file of files) {
            await this.storeFile(newIndex, file.path, file.content, file.contentType);
        }
    },
    
    getMimeType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        return MIME_TYPES[ext] || 'application/octet-stream';
    },
    
    // Get the URL for accessing a slide's index.html via Service Worker
    getSlideUrl(slideIndex) {
        return `${CACHE_PREFIX}${slideIndex}/index.html`;
    }
};

// ===== STORAGE =====
const Storage = {
    save(project) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
            console.log('[Storage] Project saved');
        } catch (e) {
            console.error('[Storage] Failed to save:', e);
        }
    },
    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            const project = data ? JSON.parse(data) : null;
            console.log('[Storage] Project loaded:', project ? project.name : 'null');
            return project;
        } catch (e) {
            console.error('[Storage] Failed to load:', e);
            return null;
        }
    },
    clear() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('[Storage] Cleared');
    }
};

// ===== UTILITIES =====
const Utils = {
    generateId() {
        return 'slide_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },
    
    async readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    },
    
    downloadFile(content, filename, type = 'application/octet-stream') {
        const blob = content instanceof Blob ? content : new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    populatePresetSelect(selectId, selectedName = null) {
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = PRESET_SIZES.map((size, index) => {
            const selected = selectedName === size.name ? 'selected' : '';
            return `<option value="${index}" ${selected}>${size.name} (${size.width}×${size.height})</option>`;
        }).join('');
    },
    
    getUrlParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }
};
