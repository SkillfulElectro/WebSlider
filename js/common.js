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
const STORAGE_KEY = 'webslider_project';

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
            console.log('Cache cleared');
        } catch (e) {
            console.warn('Failed to clear cache:', e);
        }
    },
    
    async storeFile(slideIndex, path, content, contentType = 'application/octet-stream') {
        try {
            const cache = await caches.open(CACHE_NAME);
            // Normalize path: remove leading ./ or /
            const normalizedPath = path.replace(/^\.?\//, '');
            // Use absolute URL with origin to ensure consistency
            const url = new URL(`/webslider-cache/${slideIndex}/${normalizedPath}`, window.location.origin).href;
            const response = new Response(content, { 
                headers: { 'Content-Type': contentType }
            });
            await cache.put(url, response);
            console.log('Stored:', url);
            return url;
        } catch (e) {
            console.error('Failed to store file:', path, e);
        }
    },
    
    async getFile(slideIndex, path) {
        try {
            const cache = await caches.open(CACHE_NAME);
            // Normalize path: remove leading ./ or /
            const normalizedPath = path.replace(/^\.?\//, '');
            const url = new URL(`/webslider-cache/${slideIndex}/${normalizedPath}`, window.location.origin).href;
            const response = await cache.match(url);
            if (response) {
                console.log('Found in cache:', url);
            } else {
                console.log('Not in cache:', url);
            }
            return response;
        } catch (e) {
            console.warn('Failed to get file:', path, e);
            return null;
        }
    },
    
    async getAllFilesForSlide(slideIndex) {
        try {
            const cache = await caches.open(CACHE_NAME);
            const keys = await cache.keys();
            const prefix = `/webslider-cache/${slideIndex}/`;
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
            console.log(`Found ${files.length} files for slide ${slideIndex}`);
            return files;
        } catch (e) {
            console.warn('Failed to get files:', e);
            return [];
        }
    },
    
    async deleteSlideAssets(slideIndex) {
        try {
            const cache = await caches.open(CACHE_NAME);
            const keys = await cache.keys();
            const prefix = `/webslider-cache/${slideIndex}/`;
            
            for (const request of keys) {
                const url = new URL(request.url);
                if (url.pathname.startsWith(prefix)) {
                    await cache.delete(request);
                }
            }
        } catch (e) {
            console.warn('Failed to delete slide assets:', e);
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
        const types = {
            'html': 'text/html', 'htm': 'text/html', 'css': 'text/css',
            'js': 'application/javascript', 'json': 'application/json',
            'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'gif': 'image/gif', 'svg': 'image/svg+xml', 'webp': 'image/webp',
            'ico': 'image/x-icon', 'woff': 'font/woff', 'woff2': 'font/woff2',
            'ttf': 'font/ttf', 'eot': 'application/vnd.ms-fontobject',
            'mp3': 'audio/mpeg', 'mp4': 'video/mp4', 'webm': 'video/webm', 'pdf': 'application/pdf'
        };
        return types[ext] || 'application/octet-stream';
    }
};

// ===== STORAGE =====
const Storage = {
    save(project) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
            console.log('Project saved to localStorage');
        } catch (e) {
            console.error('Failed to save project:', e);
        }
    },
    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            const project = data ? JSON.parse(data) : null;
            console.log('Project loaded from localStorage:', project ? project.name : 'null');
            return project;
        } catch (e) {
            console.error('Failed to load project:', e);
            return null;
        }
    },
    clear() {
        localStorage.removeItem(STORAGE_KEY);
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
    },
    
    async processHtmlWithCache(slideIndex, html) {
        console.log('Processing HTML for slide', slideIndex);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const blobUrls = [];
        
        // Process images
        for (const img of doc.querySelectorAll('img[src]')) {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                const response = await CacheManager.getFile(slideIndex, src);
                if (response) {
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    blobUrls.push(blobUrl);
                    img.setAttribute('src', blobUrl);
                }
            }
        }
        
        // Process stylesheets
        for (const link of doc.querySelectorAll('link[rel="stylesheet"][href]')) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('data:')) {
                const response = await CacheManager.getFile(slideIndex, href);
                if (response) {
                    let css = await response.text();
                    css = await this.processCssUrls(slideIndex, css, href, blobUrls);
                    const style = doc.createElement('style');
                    style.textContent = css;
                    link.parentNode.replaceChild(style, link);
                }
            }
        }
        
        // Process scripts
        for (const script of doc.querySelectorAll('script[src]')) {
            const src = script.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                const response = await CacheManager.getFile(slideIndex, src);
                if (response) {
                    const js = await response.text();
                    const newScript = doc.createElement('script');
                    newScript.textContent = js;
                    script.parentNode.replaceChild(newScript, script);
                }
            }
        }
        
        // Process inline styles with url()
        for (const el of doc.querySelectorAll('[style]')) {
            const style = el.getAttribute('style');
            if (style && style.includes('url(')) {
                el.setAttribute('style', await this.processCssUrls(slideIndex, style, '', blobUrls));
            }
        }
        
        // Process style tags
        for (const style of doc.querySelectorAll('style')) {
            if (style.textContent.includes('url(')) {
                style.textContent = await this.processCssUrls(slideIndex, style.textContent, '', blobUrls);
            }
        }
        
        // Process audio/video
        for (const m of doc.querySelectorAll('audio[src], video[src], source[src]')) {
            const src = m.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
                const response = await CacheManager.getFile(slideIndex, src);
                if (response) {
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    blobUrls.push(blobUrl);
                    m.setAttribute('src', blobUrl);
                }
            }
        }
        
        return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    },
    
    async processCssUrls(slideIndex, css, basePath, blobUrls = []) {
        const urlRegex = /url\(['"]?([^'")\s]+)['"]?\)/g;
        let result = css;
        const replacements = [];
        let match;
        
        while ((match = urlRegex.exec(css)) !== null) {
            const url = match[1];
            if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('blob:')) {
                // Resolve relative URL from CSS file location
                let fullPath = url;
                if (basePath) {
                    const baseDir = basePath.substring(0, basePath.lastIndexOf('/'));
                    if (url.startsWith('./')) {
                        fullPath = baseDir ? baseDir + '/' + url.substring(2) : url.substring(2);
                    } else if (!url.startsWith('/') && baseDir) {
                        fullPath = baseDir + '/' + url;
                    }
                }
                
                const response = await CacheManager.getFile(slideIndex, fullPath);
                if (response) {
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    blobUrls.push(blobUrl);
                    replacements.push({ original: match[0], replacement: `url('${blobUrl}')` });
                }
            }
        }
        
        for (const r of replacements) {
            result = result.replace(r.original, r.replacement);
        }
        return result;
    }
};
