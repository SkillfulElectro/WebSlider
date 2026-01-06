document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Index] Page loaded - registering SW and clearing cache');
    
    // Register Service Worker
    await ServiceWorkerManager.register();
    
    // Clear cache on main page load - fresh start
    await CacheManager.clear();
    Storage.clear();
    
    Utils.populatePresetSelect('sizePreset');
    renderSamples();
    setupEventListeners();
});

function renderSamples() {
    const grid = document.getElementById('samplesGrid');
    
    grid.innerHTML = SampleSlides.templates.map((sample, index) => `
        <div class="col">
            <div class="card sample-card h-100" data-sample="${index}">
                <div class="sample-preview" data-sample-index="${index}"></div>
                <div class="card-body">
                    <h5 class="card-title mb-1">${sample.name}</h5>
                    <p class="card-text text-secondary mb-2" style="font-size: .9rem;">${sample.description}</p>
                    <div class="text-secondary" style="font-size: .8rem;">${sample.slides.length} slides • ${sample.slideSize.name}</div>
                </div>
            </div>
        </div>
    `).join('');

    setTimeout(() => {
        SampleSlides.templates.forEach((sample, index) => {
            const container = document.querySelector(`[data-sample-index="${index}"]`);
            if (!container || !sample.slides[0]) return;

            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const scale = Math.min(containerWidth / sample.slideSize.width, containerHeight / sample.slideSize.height);

            const iframe = document.createElement('iframe');
            iframe.style.cssText = `width:${sample.slideSize.width}px;height:${sample.slideSize.height}px;border:none;transform:scale(${scale});transform-origin:top left;`;
            container.appendChild(iframe);
            
            // Sample slides use inline content (no assets), so document.write is fine
            iframe.contentDocument.open();
            iframe.contentDocument.write(sample.slides[0].content);
            iframe.contentDocument.close();
        });
    }, 100);
}

function setupEventListeners() {
    document.getElementById('sizePreset').addEventListener('change', (e) => {
        const preset = PRESET_SIZES[e.target.value];
        document.getElementById('slideWidth').value = preset.width;
        document.getElementById('slideHeight').value = preset.height;
    });

    document.getElementById('btnCreate').addEventListener('click', () => {
        const name = document.getElementById('projectName').value || 'Untitled Project';
        const width = parseInt(document.getElementById('slideWidth').value) || 1280;
        const height = parseInt(document.getElementById('slideHeight').value) || 720;
        const presetIndex = document.getElementById('sizePreset').value;

        const project = {
            name,
            slideSize: { width, height, name: PRESET_SIZES[presetIndex].name },
            slides: []
        };

        Storage.save(project);
        window.location.href = 'editor.html';
    });

    document.getElementById('btnImport').addEventListener('click', () => {
        document.getElementById('importInput').click();
    });

    document.getElementById('importInput').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            console.log('[Index] Importing project:', file.name);
            
            const buffer = await Utils.readFileAsArrayBuffer(file);
            const files = Tar.parse(buffer);
            
            console.log('[Index] Parsed TAR with', files.length, 'files');
            
            const manifestFile = files.find(f => f.name === 'manifest.json');
            if (!manifestFile) throw new Error('Invalid project file: missing manifest');
            
            const manifest = JSON.parse(new TextDecoder().decode(manifestFile.content));
            console.log('[Index] Manifest:', manifest);
            
            // Clear existing cache before importing
            await CacheManager.clear();
            
            const project = {
                name: manifest.name,
                slideSize: manifest.slideSize,
                slides: []
            };
            
            for (let i = 0; i < manifest.slides.length; i++) {
                const slideManifest = manifest.slides[i];
                const slidePrefix = `slides/${i}/`;
                
                const htmlFile = files.find(f => f.name === slidePrefix + 'index.html');
                if (!htmlFile) {
                    console.warn('[Index] No HTML file found for slide', i);
                    continue;
                }
                
                const content = new TextDecoder().decode(htmlFile.content);
                const slide = {
                    id: Utils.generateId(),
                    type: 'html',
                    source: slideManifest.source || `Slide ${i + 1}`,
                    content,
                    hasAssets: false
                };
                
                // Store the HTML file in cache (for SW to serve)
                const slideIndex = project.slides.length;
                await CacheManager.storeFile(slideIndex, 'index.html', htmlFile.content, 'text/html; charset=utf-8');
                
                // Find and store asset files
                const assetFiles = files.filter(f => 
                    f.name.startsWith(slidePrefix) && f.name !== slidePrefix + 'index.html'
                );
                
                console.log('[Index] Slide', i, 'has', assetFiles.length, 'assets');
                
                for (const asset of assetFiles) {
                    const relativePath = asset.name.substring(slidePrefix.length);
                    const contentType = CacheManager.getMimeType(relativePath);
                    await CacheManager.storeFile(slideIndex, relativePath, asset.content, contentType);
                }
                
                slide.hasAssets = assetFiles.length > 0;
                project.slides.push(slide);
            }
            
            console.log('[Index] Imported project with', project.slides.length, 'slides');
            
            Storage.save(project);
            window.location.href = 'editor.html';
        } catch (error) {
            alert('Error importing project: ' + error.message);
            console.error('[Index] Import error:', error);
        }

        e.target.value = '';
    });

    document.getElementById('samplesGrid').addEventListener('click', async (e) => {
        const card = e.target.closest('[data-sample]');
        if (!card) return;

        const index = parseInt(card.dataset.sample);
        const sample = SampleSlides.templates[index];

        // For sample slides, store the HTML content in cache too
        const project = {
            name: sample.name,
            slideSize: { ...sample.slideSize },
            slides: []
        };

        for (let i = 0; i < sample.slides.length; i++) {
            const s = sample.slides[i];
            const slide = {
                ...s,
                id: Utils.generateId(),
                hasAssets: false
            };
            
            // Store the HTML in cache for consistency
            await CacheManager.storeFile(i, 'index.html', new TextEncoder().encode(s.content), 'text/html; charset=utf-8');
            
            project.slides.push(slide);
        }

        Storage.save(project);
        window.location.href = 'editor.html';
    });
}
