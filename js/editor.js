let project = null;
let selectedSlideId = null;
let editingSlideId = null;
let aiProviders = [];

document.addEventListener('DOMContentLoaded', async () => {
    project = Storage.load();
    
    if (!project) {
        window.location.href = 'index.html';
        return;
    }

    if (project.slides.length > 0) {
        selectedSlideId = project.slides[0].id;
    }

    // Load AI providers
    await loadAIProviders();

    Utils.populatePresetSelect('editSizePreset', project.slideSize.name);
    await renderEditor();
    setupEventListeners();
});

async function loadAIProviders() {
    try {
        const response = await fetch('ai_providers.json');
        aiProviders = await response.json();
        renderAIProviders();
    } catch (error) {
        console.warn('Could not load AI providers:', error);
        aiProviders = [];
    }
}

function renderAIProviders() {
    const container = document.getElementById('aiProvidersList');
    if (!container || aiProviders.length === 0) return;

    container.innerHTML = aiProviders.map((provider, index) => `
        <div class="col-6 col-md-4">
            <button type="button" class="btn btn-outline-light w-100 ai-provider-btn" data-provider-index="${index}">
                ${provider.name}
            </button>
        </div>
    `).join('');
}

function generateAIPrompt() {
    const description = document.getElementById('aiSlideDescription').value.trim();
    const includePrevSlide = document.getElementById('aiIncludePrevSlide').checked;
    
    const { width, height } = project.slideSize;
    const slideNumber = project.slides.length + 1;
    
    let prevSlideContent = '';
    if (includePrevSlide && project.slides.length > 0) {
        const prevSlide = project.slides[project.slides.length - 1];
        prevSlideContent = prevSlide.content;
    }
    
    let prompt = `# Slide Generation Request

## Project Information
- **Presentation Title**: ${project.name}
- **Slide Number**: ${slideNumber} of ${project.slides.length + 1}
- **Slide Dimensions**: ${width}px × ${height}px
- **Slide Size Preset**: ${project.slideSize.name}

## Requirements
Generate a complete, self-contained HTML slide with the following specifications:

1. **Dimensions**: The slide must be exactly ${width}px wide and ${height}px tall
2. **Self-contained**: All CSS must be inline or in a <style> tag within the HTML
3. **No external dependencies**: Do not use external CSS frameworks or JavaScript libraries unless absolutely necessary
4. **Responsive within dimensions**: Content should be centered and properly sized for the specified dimensions
5. **Modern design**: Use modern CSS features like flexbox, grid, gradients, and shadows

## HTML Structure Template
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
        /* Your styles here */
    </style>
</head>
<body>
    <!-- Your content here -->
</body>
</html>
\`\`\`

## User's Slide Description
${description || 'No specific description provided. Please create an appropriate slide for this presentation.'}
`;

    if (includePrevSlide && prevSlideContent) {
        prompt += `

## Previous Slide Content (for style matching)
Please match the visual style, color scheme, fonts, and overall aesthetic of the previous slide:

\`\`\`html
${prevSlideContent}
\`\`\`

**Important**: Maintain visual consistency with the previous slide while creating new content as described above.
`;
    }

    prompt += `

## Output Instructions
1. Provide ONLY the complete HTML code for the slide
2. Ensure the code is ready to use without modifications
3. Include all styles inline or in <style> tags
4. Make sure the design is visually appealing and professional
5. Test that content fits within ${width}×${height} pixels without scrolling

Please generate the HTML slide now:`;

    return prompt;
}

function openAIProvider(providerIndex) {
    const provider = aiProviders[providerIndex];
    if (!provider) return;
    
    const prompt = generateAIPrompt();
    const encodedPrompt = encodeURIComponent(prompt);
    const url = provider.search_template.replace('{query}', encodedPrompt);
    
    window.open(url, '_blank');
}

function getAvailableCanvasSize() {
    const canvas = document.getElementById('mainCanvas');
    if (!canvas) return { width: 800, height: 600 };

    const style = getComputedStyle(canvas);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const reservedHeight = 100;

    return {
        width: canvas.clientWidth - paddingX - 20,
        height: canvas.clientHeight - paddingY - reservedHeight
    };
}

async function renderEditor() {
    document.getElementById('projectTitle').textContent = project.name;
    document.getElementById('projectInfo').textContent = 
        `${project.slideSize.name} • ${project.slideSize.width}×${project.slideSize.height} • ${project.slides.length} slides`;

    await renderThumbnails();
    await renderMainSlide();

    document.getElementById('editProjectName').value = project.name;
    document.getElementById('editSlideWidth').value = project.slideSize.width;
    document.getElementById('editSlideHeight').value = project.slideSize.height;
}

async function renderThumbnails() {
    const { width, height } = project.slideSize;
    await renderVerticalThumbnails(width, height);
    await renderHorizontalThumbnails(width, height);
}

async function renderVerticalThumbnails(slideWidth, slideHeight) {
    const container = document.getElementById('thumbnails');
    if (!container) return;

    const thumbWidth = 160;
    const scale = thumbWidth / slideWidth;
    const thumbHeight = slideHeight * scale;

    let html = project.slides.map((slide, index) => `
        <div class="slide-thumbnail ${slide.id === selectedSlideId ? 'selected' : ''}" data-slide-id="${slide.id}">
            <div class="thumb-number">${index + 1}</div>
            <div class="thumb-preview" style="width: ${thumbWidth}px; height: ${thumbHeight}px;"></div>
            ${slide.hasAssets ? '<div class="asset-badge">📁</div>' : ''}
        </div>
    `).join('');

    html += `<div class="add-slide-thumb" data-bs-toggle="modal" data-bs-target="#addSlideModal">+ Add Slide</div>`;
    container.innerHTML = html;

    // Render thumbnails with a small delay
    for (let i = 0; i < project.slides.length; i++) {
        const slide = project.slides[i];
        const thumbEl = container.querySelector(`[data-slide-id="${slide.id}"] .thumb-preview`);
        if (!thumbEl) continue;

        const iframe = document.createElement('iframe');
        iframe.style.cssText = `width:${slideWidth}px;height:${slideHeight}px;transform:scale(${scale});`;
        thumbEl.appendChild(iframe);

        let content = slide.content;
        if (slide.hasAssets) {
            content = await Utils.processHtmlWithCache(i, content);
        }

        iframe.contentDocument.open();
        iframe.contentDocument.write(content);
        iframe.contentDocument.close();
    }
}

async function renderHorizontalThumbnails(slideWidth, slideHeight) {
    const container = document.getElementById('thumbnailsMobile');
    if (!container) return;

    const thumbHeight = 70;
    const scale = thumbHeight / slideHeight;
    const thumbWidth = slideWidth * scale;

    let html = project.slides.map((slide, index) => `
        <div class="slide-thumbnail-h ${slide.id === selectedSlideId ? 'selected' : ''}" data-slide-id="${slide.id}">
            <div class="thumb-number">${index + 1}</div>
            <div class="thumb-preview" style="width: ${thumbWidth}px; height: ${thumbHeight}px;"></div>
        </div>
    `).join('');

    html += `<div class="add-slide-h" style="height: ${thumbHeight}px;" data-bs-toggle="modal" data-bs-target="#addSlideModal">+ Add</div>`;
    container.innerHTML = html;

    for (let i = 0; i < project.slides.length; i++) {
        const slide = project.slides[i];
        const thumbEl = container.querySelector(`[data-slide-id="${slide.id}"] .thumb-preview`);
        if (!thumbEl) continue;

        const iframe = document.createElement('iframe');
        iframe.style.cssText = `width:${slideWidth}px;height:${slideHeight}px;transform:scale(${scale});`;
        thumbEl.appendChild(iframe);

        let content = slide.content;
        if (slide.hasAssets) {
            content = await Utils.processHtmlWithCache(i, content);
        }

        iframe.contentDocument.open();
        iframe.contentDocument.write(content);
        iframe.contentDocument.close();
    }
}

async function renderMainSlide() {
    const area = document.getElementById('mainSlideArea');
    const actions = document.getElementById('slideActions');
    const currentSlide = project.slides.find(s => s.id === selectedSlideId);
    const currentIndex = project.slides.findIndex(s => s.id === selectedSlideId);

    if (!currentSlide) {
        area.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📑</div>
                <h4 class="text-secondary mb-3">No slides yet</h4>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addSlideModal">
                    <span class="me-1">+</span> Add Your First Slide
                </button>
            </div>
        `;
        actions.innerHTML = '';
        return;
    }

    const { width: slideWidth, height: slideHeight } = project.slideSize;
    const available = getAvailableCanvasSize();
    
    const scale = Math.min(available.width / slideWidth, available.height / slideHeight, 1);
    const displayWidth = slideWidth * scale;
    const displayHeight = slideHeight * scale;

    area.innerHTML = `
        <div class="slide-wrapper" style="width:${displayWidth}px;height:${displayHeight}px;">
            <iframe style="width:${slideWidth}px;height:${slideHeight}px;transform:scale(${scale});"></iframe>
        </div>
        <div class="slide-info">
            <span>${currentSlide.source || 'HTML Content'} — ${slideWidth}×${slideHeight} @ ${Math.round(scale * 100)}%${currentSlide.hasAssets ? ' 📁' : ''}</span>
        </div>
    `;

    const iframe = area.querySelector('iframe');
    
    let content = currentSlide.content;
    if (currentSlide.hasAssets) {
        content = await Utils.processHtmlWithCache(currentIndex, content);
    }

    iframe.contentDocument.open();
    iframe.contentDocument.write(content);
    iframe.contentDocument.close();

    const moveUpBtn = currentIndex > 0 ? `<button class="btn btn-sm btn-outline-secondary" data-action="move-up" title="Move up">↑</button>` : '';
    const moveDownBtn = currentIndex < project.slides.length - 1 ? `<button class="btn btn-sm btn-outline-secondary" data-action="move-down" title="Move down">↓</button>` : '';

    actions.innerHTML = `
        <button class="btn btn-sm btn-outline-light" data-action="edit" title="Replace content">📝 <span>Edit</span></button>
        <button class="btn btn-sm btn-outline-light" data-action="assets" title="Manage assets">📁 <span>Assets</span></button>
        <button class="btn btn-sm btn-outline-light" data-action="duplicate" title="Duplicate slide">📋 <span>Copy</span></button>
        ${moveUpBtn}${moveDownBtn}
        <button class="btn btn-sm btn-outline-danger" data-action="delete" title="Delete slide">🗑️</button>
    `;
}

function setupEventListeners() {
    document.getElementById('thumbnails').addEventListener('click', async (e) => {
        const thumb = e.target.closest('.slide-thumbnail');
        if (thumb && thumb.dataset.slideId) {
            selectedSlideId = thumb.dataset.slideId;
            await renderEditor();
        }
    });

    document.getElementById('thumbnailsMobile').addEventListener('click', async (e) => {
        const thumb = e.target.closest('.slide-thumbnail-h');
        if (thumb && thumb.dataset.slideId) {
            selectedSlideId = thumb.dataset.slideId;
            await renderEditor();
        }
    });

    document.getElementById('slideActions').addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const currentSlide = project.slides.find(s => s.id === selectedSlideId);
        const currentIndex = project.slides.findIndex(s => s.id === selectedSlideId);

        switch (action) {
            case 'edit':
                editingSlideId = selectedSlideId;
                document.getElementById('addSlideTitle').textContent = 'Replace Slide Content';
                bootstrap.Modal.getOrCreateInstance(document.getElementById('addSlideModal')).show();
                break;

            case 'assets':
                document.getElementById('folderInput').click();
                break;

            case 'duplicate':
                const files = await CacheManager.getAllFilesForSlide(currentIndex);
                const newIndex = project.slides.length;
                
                const duplicate = {
                    id: Utils.generateId(),
                    content: currentSlide.content,
                    type: currentSlide.type,
                    source: currentSlide.source + ' (copy)',
                    hasAssets: currentSlide.hasAssets
                };
                
                for (const file of files) {
                    await CacheManager.storeFile(newIndex, file.path, file.content, file.contentType);
                }
                
                project.slides.push(duplicate);
                selectedSlideId = duplicate.id;
                Storage.save(project);
                await renderEditor();
                break;

            case 'move-up':
                if (currentIndex > 0) {
                    const filesA = await CacheManager.getAllFilesForSlide(currentIndex);
                    const filesB = await CacheManager.getAllFilesForSlide(currentIndex - 1);
                    
                    await CacheManager.deleteSlideAssets(currentIndex);
                    await CacheManager.deleteSlideAssets(currentIndex - 1);
                    
                    for (const f of filesA) await CacheManager.storeFile(currentIndex - 1, f.path, f.content, f.contentType);
                    for (const f of filesB) await CacheManager.storeFile(currentIndex, f.path, f.content, f.contentType);
                    
                    [project.slides[currentIndex], project.slides[currentIndex - 1]] = [project.slides[currentIndex - 1], project.slides[currentIndex]];
                    Storage.save(project);
                    await renderEditor();
                }
                break;

            case 'move-down':
                if (currentIndex < project.slides.length - 1) {
                    const filesA = await CacheManager.getAllFilesForSlide(currentIndex);
                    const filesB = await CacheManager.getAllFilesForSlide(currentIndex + 1);
                    
                    await CacheManager.deleteSlideAssets(currentIndex);
                    await CacheManager.deleteSlideAssets(currentIndex + 1);
                    
                    for (const f of filesA) await CacheManager.storeFile(currentIndex + 1, f.path, f.content, f.contentType);
                    for (const f of filesB) await CacheManager.storeFile(currentIndex, f.path, f.content, f.contentType);
                    
                    [project.slides[currentIndex], project.slides[currentIndex + 1]] = [project.slides[currentIndex + 1], project.slides[currentIndex]];
                    Storage.save(project);
                    await renderEditor();
                }
                break;

            case 'delete':
                if (confirm('Delete this slide and all its assets?')) {
                    await CacheManager.deleteSlideAssets(currentIndex);
                    project.slides = project.slides.filter(s => s.id !== selectedSlideId);
                    
                    for (let i = currentIndex; i < project.slides.length; i++) {
                        await CacheManager.renumberSlides(i + 1, i);
                    }
                    
                    selectedSlideId = project.slides.length > 0 ? project.slides[Math.min(currentIndex, project.slides.length - 1)].id : null;
                    Storage.save(project);
                    await renderEditor();
                }
                break;
        }
    });

    // HTML file upload
    const uploadAreaHtml = document.getElementById('uploadAreaHtml');
    const htmlFileInput = document.getElementById('htmlFileInput');

    uploadAreaHtml.addEventListener('click', () => htmlFileInput.click());
    uploadAreaHtml.addEventListener('dragover', (e) => { e.preventDefault(); uploadAreaHtml.classList.add('drag-over'); });
    uploadAreaHtml.addEventListener('dragleave', () => uploadAreaHtml.classList.remove('drag-over'));
    uploadAreaHtml.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadAreaHtml.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
            handleHtmlFileUpload(file);
        }
    });

    htmlFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleHtmlFileUpload(file);
        e.target.value = '';
    });

    // Folder upload
    document.getElementById('uploadAreaFolder').addEventListener('click', () => document.getElementById('folderInput').click());
    document.getElementById('folderInput').addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) await handleFolderUpload(files);
        e.target.value = '';
    });

    document.getElementById('addSlideModal').addEventListener('hidden.bs.modal', () => {
        editingSlideId = null;
        document.getElementById('addSlideTitle').textContent = 'Add New Slide';
    });

    document.getElementById('editSizePreset').addEventListener('change', (e) => {
        const preset = PRESET_SIZES[e.target.value];
        document.getElementById('editSlideWidth').value = preset.width;
        document.getElementById('editSlideHeight').value = preset.height;
    });

    document.getElementById('btnSaveSettings').addEventListener('click', async () => {
        project.name = document.getElementById('editProjectName').value || 'Untitled';
        project.slideSize.width = parseInt(document.getElementById('editSlideWidth').value) || 1280;
        project.slideSize.height = parseInt(document.getElementById('editSlideHeight').value) || 720;
        project.slideSize.name = PRESET_SIZES[document.getElementById('editSizePreset').value].name;

        Storage.save(project);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('settingsModal')).hide();
        await renderEditor();
    });

    document.getElementById('btnPresent').addEventListener('click', startPresentation);
    document.getElementById('btnPresentMobile').addEventListener('click', startPresentation);
    document.getElementById('btnSave').addEventListener('click', exportProject);
    document.getElementById('btnSaveMobile').addEventListener('click', (e) => { e.preventDefault(); exportProject(); });
    document.getElementById('btnPDF').addEventListener('click', exportAsPDF);
    document.getElementById('btnPDFMobile').addEventListener('click', (e) => { e.preventDefault(); exportAsPDF(); });
    document.getElementById('btnSettingsMobile').addEventListener('click', (e) => {
        e.preventDefault();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('settingsModal')).show();
    });

    document.getElementById('btnHome').addEventListener('click', async (e) => {
        if (project.slides.length === 0 || confirm('Go back? This will clear the project.')) {
            await CacheManager.clear();
            Storage.clear();
            return true;
        }
        e.preventDefault();
    });

    document.addEventListener('keydown', (e) => {
        if (document.querySelector('.modal.show')) return;

        if (e.key === 'F5') {
            e.preventDefault();
            if (project.slides.length === 0) { alert('Add at least one slide.'); return; }
            const startSlide = e.shiftKey ? project.slides.findIndex(s => s.id === selectedSlideId) : 0;
            Storage.save(project);
            window.location.href = `present.html?slide=${Math.max(0, startSlide)}`;
        } else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            exportProject();
        }
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => renderMainSlide(), 150);
    });

    // AI Modal event listeners
    document.getElementById('aiProvidersList')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.ai-provider-btn');
        if (btn) {
            const providerIndex = parseInt(btn.dataset.providerIndex);
            openAIProvider(providerIndex);
        }
    });

    document.getElementById('btnCopyPrompt')?.addEventListener('click', () => {
        const prompt = generateAIPrompt();
        navigator.clipboard.writeText(prompt).then(() => {
            const btn = document.getElementById('btnCopyPrompt');
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Copied!';
            btn.classList.remove('btn-info');
            btn.classList.add('btn-success');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-info');
            }, 2000);
        }).catch(err => {
            alert('Failed to copy prompt: ' + err.message);
        });
    });

    // Close add slide modal when AI modal opens
    document.getElementById('btnOpenAI')?.addEventListener('click', () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('addSlideModal')).hide();
    });
}

async function handleHtmlFileUpload(file) {
    try {
        const content = await Utils.readFileAsText(file);

        if (editingSlideId) {
            const slide = project.slides.find(s => s.id === editingSlideId);
            if (slide) {
                slide.content = content;
                slide.source = file.name;
                slide.type = 'html';
                // Clear assets if replacing with plain HTML
                const slideIndex = project.slides.findIndex(s => s.id === editingSlideId);
                await CacheManager.deleteSlideAssets(slideIndex);
                slide.hasAssets = false;
            }
            editingSlideId = null;
        } else {
            const slide = { id: Utils.generateId(), content, type: 'html', source: file.name, hasAssets: false };
            project.slides.push(slide);
            selectedSlideId = slide.id;
        }

        Storage.save(project);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('addSlideModal')).hide();
        await renderEditor();
    } catch (error) {
        alert('Error reading file: ' + error.message);
    }
}

async function handleFolderUpload(files) {
    try {
        console.log('Uploading folder with', files.length, 'files');
        
        // Find the HTML file - prefer index.html
        let htmlFile = files.find(f => f.webkitRelativePath.endsWith('/index.html') || f.name === 'index.html');
        if (!htmlFile) {
            htmlFile = files.find(f => f.name.endsWith('.html') || f.name.endsWith('.htm'));
        }
        
        if (!htmlFile) {
            alert('No HTML file found in the folder.');
            return;
        }

        console.log('Found HTML file:', htmlFile.webkitRelativePath || htmlFile.name);

        const htmlContent = await Utils.readFileAsText(htmlFile);
        
        // Determine the HTML file's directory relative to the root folder
        const htmlPath = htmlFile.webkitRelativePath;
        const firstPath = files[0].webkitRelativePath;
        const rootFolder = firstPath.split('/')[0];
        
        // Get HTML file directory (relative to root folder)
        let htmlDir = '';
        if (htmlPath.startsWith(rootFolder + '/')) {
            const relativePath = htmlPath.substring(rootFolder.length + 1);
            const lastSlash = relativePath.lastIndexOf('/');
            if (lastSlash > 0) {
                htmlDir = relativePath.substring(0, lastSlash);
            }
        }
        
        console.log('Root folder:', rootFolder, 'HTML dir:', htmlDir);
        
        let slideIndex;
        if (editingSlideId) {
            slideIndex = project.slides.findIndex(s => s.id === editingSlideId);
            const slide = project.slides[slideIndex];
            slide.content = htmlContent;
            slide.source = htmlFile.name;
            slide.hasAssets = true;
            await CacheManager.deleteSlideAssets(slideIndex);
        } else {
            slideIndex = project.slides.length;
            const slide = { id: Utils.generateId(), content: htmlContent, type: 'html', source: htmlFile.name, hasAssets: true };
            project.slides.push(slide);
            selectedSlideId = slide.id;
        }

        // Store all non-HTML files in cache
        let assetsStored = 0;
        for (const file of files) {
            // Skip the HTML file
            if (file.webkitRelativePath === htmlFile.webkitRelativePath) continue;
            
            let relativePath = file.webkitRelativePath;
            // Remove root folder prefix
            if (relativePath.startsWith(rootFolder + '/')) {
                relativePath = relativePath.substring(rootFolder.length + 1);
            }
            
            // If HTML is in a subdirectory, adjust paths to be relative to HTML file
            if (htmlDir) {
                if (relativePath.startsWith(htmlDir + '/')) {
                    relativePath = relativePath.substring(htmlDir.length + 1);
                } else {
                    // File is outside HTML dir - use relative path with ../
                    // For simplicity, we still store with the original relative path
                }
            }
            
            console.log('Storing asset:', relativePath);
            
            const buffer = await Utils.readFileAsArrayBuffer(file);
            const contentType = CacheManager.getMimeType(file.name);
            await CacheManager.storeFile(slideIndex, relativePath, new Uint8Array(buffer), contentType);
            assetsStored++;
        }
        
        console.log('Stored', assetsStored, 'assets for slide', slideIndex);

        // Update hasAssets based on whether we actually stored anything
        const slide = project.slides[slideIndex];
        slide.hasAssets = assetsStored > 0;

        editingSlideId = null;
        Storage.save(project);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('addSlideModal'))?.hide();
        await renderEditor();
    } catch (error) {
        alert('Error processing folder: ' + error.message);
        console.error(error);
    }
}

function startPresentation() {
    if (project.slides.length === 0) { 
        alert('Add at least one slide.'); 
        return; 
    }
    Storage.save(project);
    window.location.href = 'present.html?slide=0';
}

async function exportProject() {
    try {
        const tarFiles = [];
        
        const manifest = {
            name: project.name,
            slideSize: project.slideSize,
            slides: project.slides.map(s => ({ 
                source: s.source, 
                hasAssets: s.hasAssets || false 
            }))
        };
        
        tarFiles.push({ name: 'manifest.json', content: JSON.stringify(manifest, null, 2), isText: true });
        
        for (let i = 0; i < project.slides.length; i++) {
            const slide = project.slides[i];
            tarFiles.push({ name: `slides/${i}/index.html`, content: slide.content, isText: true });
            
            if (slide.hasAssets) {
                const assets = await CacheManager.getAllFilesForSlide(i);
                console.log(`Exporting slide ${i} with ${assets.length} assets`);
                for (const asset of assets) {
                    tarFiles.push({ name: `slides/${i}/${asset.path}`, content: asset.content, isText: false });
                }
            }
        }
        
        console.log('Creating TAR with', tarFiles.length, 'files');
        const tarData = Tar.create(tarFiles);
        Utils.downloadFile(tarData, `${project.name}.webslider`, 'application/x-tar');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting project: ' + error.message);
    }
}

async function exportAsPDF() {
    if (typeof window.jspdf === 'undefined') {
        alert('PDF library not loaded. Please refresh the page.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const { width, height } = project.slideSize;
    const orientation = width > height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height] });
    const slides = project.slides;

    if (slides.length === 0) { 
        alert('No slides to export!'); 
        return; 
    }

    const captureHost = document.getElementById('pdf-capture');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'pdf-loading-overlay';
    loadingDiv.innerHTML = `<div class="pdf-loading-content"><div class="spinner-border text-primary mb-3" style="width:3rem;height:3rem;"></div><p id="exportProgress">Preparing...</p></div>`;
    document.body.appendChild(loadingDiv);

    try {
        captureHost.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;z-index:9998;overflow:hidden;`;

        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            document.getElementById('exportProgress').textContent = `Exporting slide ${i + 1} of ${slides.length}...`;

            captureHost.innerHTML = '';
            const iframe = document.createElement('iframe');
            iframe.style.cssText = `width:${width}px;height:${height}px;border:none;`;
            captureHost.appendChild(iframe);

            let content = slide.content;
            if (slide.hasAssets) {
                content = await Utils.processHtmlWithCache(i, content);
            }

            const doc = iframe.contentDocument;
            doc.open();
            doc.write(content);
            doc.close();

            // Wait for document to be ready
            await new Promise(r => { 
                const check = () => doc.readyState === 'complete' ? r() : setTimeout(check, 50); 
                setTimeout(check, 100); 
            });
            
            // Wait for fonts
            try { 
                if (doc.fonts?.ready) await doc.fonts.ready; 
            } catch {}
            
            // Extra delay for rendering
            await new Promise(r => setTimeout(r, 200));

            const dataUrl = await htmlToImage.toJpeg(doc.body, { 
                canvasWidth: width, 
                canvasHeight: height, 
                pixelRatio: 1, 
                quality: 0.9 
            });
            
            if (i > 0) pdf.addPage([width, height], orientation);
            pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height);
        }

        pdf.save(`${project.name}.pdf`);
    } catch (error) {
        console.error('PDF Export Error:', error);
        alert('Error exporting PDF: ' + error.message);
    } finally {
        captureHost.innerHTML = '';
        captureHost.style.cssText = 'position:fixed;left:-9999px;top:0;';
        loadingDiv.remove();
    }
}
