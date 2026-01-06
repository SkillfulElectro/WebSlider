let project = null;
let selectedSlideId = null;
let editingSlideId = null;

document.addEventListener('DOMContentLoaded', () => {
    project = Storage.load();
    
    if (!project) {
        window.location.href = 'index.html';
        return;
    }

    if (project.slides.length > 0) {
        selectedSlideId = project.slides[0].id;
    }

    Utils.populatePresetSelect('editSizePreset', project.slideSize.name);
    renderEditor();
    setupEventListeners();
});

function getAvailableCanvasSize() {
    const canvas = document.getElementById('mainCanvas');
    if (!canvas) return { width: 800, height: 600 };

    const style = getComputedStyle(canvas);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

    // Reserve space for slide info and actions
    const reservedHeight = 100;

    return {
        width: canvas.clientWidth - paddingX - 20,
        height: canvas.clientHeight - paddingY - reservedHeight
    };
}

function renderEditor() {
    // Update header
    document.getElementById('projectTitle').textContent = project.name;
    document.getElementById('projectInfo').textContent = 
        `${project.slideSize.name} • ${project.slideSize.width}×${project.slideSize.height} • ${project.slides.length} slides`;

    // Render thumbnails
    renderThumbnails();

    // Render main slide
    renderMainSlide();

    // Update settings modal
    document.getElementById('editProjectName').value = project.name;
    document.getElementById('editSlideWidth').value = project.slideSize.width;
    document.getElementById('editSlideHeight').value = project.slideSize.height;
}

function renderThumbnails() {
    const { width, height } = project.slideSize;
    
    // Desktop thumbnails
    renderVerticalThumbnails(width, height);
    
    // Mobile thumbnails
    renderHorizontalThumbnails(width, height);
}

function renderVerticalThumbnails(slideWidth, slideHeight) {
    const container = document.getElementById('thumbnails');
    if (!container) return;

    const thumbWidth = 160;
    const scale = thumbWidth / slideWidth;
    const thumbHeight = slideHeight * scale;

    let html = project.slides.map((slide, index) => `
        <div class="slide-thumbnail ${slide.id === selectedSlideId ? 'selected' : ''}" data-slide-id="${slide.id}">
            <div class="thumb-number">${index + 1}</div>
            <div class="thumb-preview" style="width: ${thumbWidth}px; height: ${thumbHeight}px;"></div>
        </div>
    `).join('');

    html += `<div class="add-slide-thumb" data-bs-toggle="modal" data-bs-target="#addSlideModal">+ Add Slide</div>`;

    container.innerHTML = html;

    // Initialize thumbnail iframes
    setTimeout(() => {
        project.slides.forEach(slide => {
            const thumbEl = container.querySelector(`[data-slide-id="${slide.id}"] .thumb-preview`);
            if (!thumbEl) return;

            const iframe = document.createElement('iframe');
            iframe.style.cssText = `width:${slideWidth}px;height:${slideHeight}px;transform:scale(${scale});`;
            thumbEl.appendChild(iframe);

            iframe.contentDocument.open();
            iframe.contentDocument.write(slide.content);
            iframe.contentDocument.close();
        });
    }, 50);
}

function renderHorizontalThumbnails(slideWidth, slideHeight) {
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

    // Initialize thumbnail iframes
    setTimeout(() => {
        project.slides.forEach(slide => {
            const thumbEl = container.querySelector(`[data-slide-id="${slide.id}"] .thumb-preview`);
            if (!thumbEl) return;

            const iframe = document.createElement('iframe');
            iframe.style.cssText = `width:${slideWidth}px;height:${slideHeight}px;transform:scale(${scale});`;
            thumbEl.appendChild(iframe);

            iframe.contentDocument.open();
            iframe.contentDocument.write(slide.content);
            iframe.contentDocument.close();
        });
    }, 50);
}

function renderMainSlide() {
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
    
    // Calculate scale to fit slide in available space
    const scale = Math.min(
        available.width / slideWidth,
        available.height / slideHeight,
        1 // Don't scale up beyond 100%
    );

    const displayWidth = slideWidth * scale;
    const displayHeight = slideHeight * scale;

    area.innerHTML = `
        <div class="slide-wrapper" style="width:${displayWidth}px;height:${displayHeight}px;">
            <iframe style="width:${slideWidth}px;height:${slideHeight}px;transform:scale(${scale});"></iframe>
        </div>
        <div class="slide-info">
            <span>${currentSlide.source || 'HTML Content'} — ${slideWidth}×${slideHeight} @ ${Math.round(scale * 100)}%</span>
        </div>
    `;

    // Write content to iframe
    const iframe = area.querySelector('iframe');
    iframe.contentDocument.open();
    iframe.contentDocument.write(currentSlide.content);
    iframe.contentDocument.close();

    // Slide actions
    const moveUpBtn = currentIndex > 0 
        ? `<button class="btn btn-sm btn-outline-secondary" data-action="move-up" title="Move up">↑</button>` 
        : '';
    const moveDownBtn = currentIndex < project.slides.length - 1 
        ? `<button class="btn btn-sm btn-outline-secondary" data-action="move-down" title="Move down">↓</button>` 
        : '';

    actions.innerHTML = `
        <button class="btn btn-sm btn-outline-light" data-action="edit" title="Replace content">📝 <span>Edit</span></button>
        <button class="btn btn-sm btn-outline-light" data-action="duplicate" title="Duplicate slide">📋 <span>Copy</span></button>
        ${moveUpBtn}
        ${moveDownBtn}
        <button class="btn btn-sm btn-outline-danger" data-action="delete" title="Delete slide">🗑️</button>
    `;
}

function setupEventListeners() {
    // Thumbnail clicks - Desktop
    document.getElementById('thumbnails').addEventListener('click', (e) => {
        const thumb = e.target.closest('.slide-thumbnail');
        if (thumb && thumb.dataset.slideId) {
            selectedSlideId = thumb.dataset.slideId;
            renderEditor();
        }
    });

    // Thumbnail clicks - Mobile
    document.getElementById('thumbnailsMobile').addEventListener('click', (e) => {
        const thumb = e.target.closest('.slide-thumbnail-h');
        if (thumb && thumb.dataset.slideId) {
            selectedSlideId = thumb.dataset.slideId;
            renderEditor();
        }
    });

    // Slide actions
    document.getElementById('slideActions').addEventListener('click', (e) => {
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

            case 'duplicate':
                const duplicate = {
                    id: Utils.generateId(),
                    content: currentSlide.content,
                    type: currentSlide.type,
                    source: currentSlide.source + ' (copy)'
                };
                project.slides.splice(currentIndex + 1, 0, duplicate);
                selectedSlideId = duplicate.id;
                Storage.save(project);
                renderEditor();
                break;

            case 'move-up':
                if (currentIndex > 0) {
                    [project.slides[currentIndex], project.slides[currentIndex - 1]] = 
                    [project.slides[currentIndex - 1], project.slides[currentIndex]];
                    Storage.save(project);
                    renderEditor();
                }
                break;

            case 'move-down':
                if (currentIndex < project.slides.length - 1) {
                    [project.slides[currentIndex], project.slides[currentIndex + 1]] = 
                    [project.slides[currentIndex + 1], project.slides[currentIndex]];
                    Storage.save(project);
                    renderEditor();
                }
                break;

            case 'delete':
                if (confirm('Delete this slide?')) {
                    project.slides = project.slides.filter(s => s.id !== selectedSlideId);
                    if (project.slides.length > 0) {
                        selectedSlideId = project.slides[Math.min(currentIndex, project.slides.length - 1)].id;
                    } else {
                        selectedSlideId = null;
                    }
                    Storage.save(project);
                    renderEditor();
                }
                break;
        }
    });

    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('htmlFileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
            handleFileUpload(file);
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
        e.target.value = '';
    });

    // Modal reset
    document.getElementById('addSlideModal').addEventListener('hidden.bs.modal', () => {
        editingSlideId = null;
        document.getElementById('addSlideTitle').textContent = 'Add New Slide';
    });

    // Settings preset change
    document.getElementById('editSizePreset').addEventListener('change', (e) => {
        const preset = PRESET_SIZES[e.target.value];
        document.getElementById('editSlideWidth').value = preset.width;
        document.getElementById('editSlideHeight').value = preset.height;
    });

    // Save settings
    document.getElementById('btnSaveSettings').addEventListener('click', () => {
        project.name = document.getElementById('editProjectName').value || 'Untitled';
        project.slideSize.width = parseInt(document.getElementById('editSlideWidth').value) || 1280;
        project.slideSize.height = parseInt(document.getElementById('editSlideHeight').value) || 720;
        project.slideSize.name = PRESET_SIZES[document.getElementById('editSizePreset').value].name;

        Storage.save(project);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('settingsModal')).hide();
        renderEditor();
    });

    // Present buttons
    document.getElementById('btnPresent').addEventListener('click', startPresentation);
    document.getElementById('btnPresentMobile').addEventListener('click', startPresentation);

    // Save buttons
    document.getElementById('btnSave').addEventListener('click', exportProject);
    document.getElementById('btnSaveMobile').addEventListener('click', (e) => {
        e.preventDefault();
        exportProject();
    });

    // PDF buttons
    document.getElementById('btnPDF').addEventListener('click', exportAsPDF);
    document.getElementById('btnPDFMobile').addEventListener('click', (e) => {
        e.preventDefault();
        exportAsPDF();
    });

    // Settings mobile
    document.getElementById('btnSettingsMobile').addEventListener('click', (e) => {
        e.preventDefault();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('settingsModal')).show();
    });

    // Home button
    document.getElementById('btnHome').addEventListener('click', (e) => {
        if (project.slides.length === 0 || confirm('Go back? Unsaved changes will be lost.')) {
            return true;
        }
        e.preventDefault();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if modal is open
        if (document.querySelector('.modal.show')) return;

        if (e.key === 'F5') {
            e.preventDefault();
            if (project.slides.length === 0) {
                alert('Add at least one slide to start presentation.');
                return;
            }
            const startSlide = e.shiftKey ? project.slides.findIndex(s => s.id === selectedSlideId) : 0;
            Storage.save(project);
            window.location.href = `present.html?slide=${Math.max(0, startSlide)}`;
        } else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            exportProject();
        }
    });

    // Window resize - debounced
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            renderMainSlide();
        }, 150);
    });
}

async function handleFileUpload(file) {
    try {
        const content = await Utils.readFileAsText(file);

        if (editingSlideId) {
            const slide = project.slides.find(s => s.id === editingSlideId);
            if (slide) {
                slide.content = content;
                slide.source = file.name;
                slide.type = 'html';
            }
            editingSlideId = null;
        } else {
            const slide = {
                id: Utils.generateId(),
                content,
                type: 'html',
                source: file.name
            };
            project.slides.push(slide);
            selectedSlideId = slide.id;
        }

        Storage.save(project);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('addSlideModal')).hide();
        renderEditor();
    } catch (error) {
        alert('Error reading file: ' + error.message);
    }
}

function startPresentation() {
    if (project.slides.length === 0) {
        alert('Add at least one slide to start presentation.');
        return;
    }
    Storage.save(project);
    window.location.href = 'present.html?slide=0';
}

function exportProject() {
    const projectData = JSON.stringify(project, null, 2);
    Utils.downloadFile(projectData, `${project.name}.webslider`, 'application/json');
}

async function exportAsPDF() {
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

    // Loading overlay
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'pdf-loading-overlay';
    loadingDiv.innerHTML = `
        <div class="pdf-loading-content">
            <div class="spinner-border text-primary mb-3" style="width:3rem;height:3rem;"></div>
            <p id="exportProgress">Preparing slide 1 of ${slides.length}...</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    try {
        captureHost.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;z-index:9998;overflow:hidden;`;

        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            document.getElementById('exportProgress').textContent = `Exporting slide ${i + 1} of ${slides.length}...`;

            captureHost.innerHTML = '';

            const iframe = document.createElement('iframe');
            iframe.style.cssText = `width:${width}px;height:${height}px;border:none;`;
            captureHost.appendChild(iframe);

            const doc = iframe.contentDocument;
            doc.open();
            doc.write(slide.content);
            doc.close();

            await new Promise((resolve) => {
                const checkReady = () => {
                    if (doc.readyState === 'complete') resolve();
                    else setTimeout(checkReady, 50);
                };
                setTimeout(checkReady, 100);
            });

            try {
                if (doc.fonts && doc.fonts.ready) await doc.fonts.ready;
            } catch {}

            await wait(150);

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