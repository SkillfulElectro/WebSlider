const Renderer = {
    render() {
        const app = document.getElementById('app');
        
        if (AppState.currentPage === 'main') {
            app.innerHTML = this.renderMainPage();
            this.initSamplePreviews();
        } else {
            app.innerHTML = this.renderSliderPage();
            this.initSlideIframes();
        }
    },

    renderMainPage() {
        const samplesHTML = SampleSlides.templates.map((sample, index) => `
            <div class="col">
                <div class="card sample-card h-100" onclick="SampleSlides.loadSample(${index})">
                    <div class="sample-preview" data-sample-index="${index}"></div>
                    <div class="card-body">
                        <h5 class="card-title mb-1">${sample.name}</h5>
                        <p class="card-text text-secondary mb-2" style="font-size: .9rem;">${sample.description}</p>
                        <div class="text-secondary" style="font-size: .8rem;">${sample.slides.length} slides • ${sample.slideSize.name}</div>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="container py-5">
                <div class="text-center mb-5 pt-4">
                    <h1 class="display-3 fw-bold gradient-text mb-3">WebSlider</h1>
                    <p class="lead text-secondary">Create stunning presentations with HTML slides</p>
                </div>

                <div class="d-flex gap-3 justify-content-center flex-wrap mb-5">
                    <button onclick="EventHandlers.onImportProject()" class="btn btn-outline-light btn-lg px-4">
                        <span class="me-2">📂</span>
                        Open Project
                    </button>

                    <button onclick="Modal.show('newProject')" class="btn btn-primary btn-lg px-4">
                        <span class="me-2">✨</span>
                        New Presentation
                    </button>
                </div>

                <div class="mx-auto" style="max-width: 1100px;">
                    <h2 class="h5 fw-semibold text-center text-secondary mb-4">Or start with a template</h2>
                    <div class="row row-cols-1 row-cols-md-3 g-4">
                        ${samplesHTML}
                    </div>
                </div>

                <div class="text-center text-secondary mt-5" style="font-size:.85rem;">
                    <span class="me-3">💾 Saves as .webslider</span>
                    <span class="me-3">📄 Export to PDF</span>
                    <span>🖥️ Present fullscreen</span>
                </div>
            </div>

            ${Modal.renderNewProjectModal()}
        `;
    },

    renderSliderPage() {
        const { width, height, name } = AppState.project.slideSize;
        const maxWidth = Math.min(window.innerWidth - 300, 900);
        const maxHeight = window.innerHeight - 180;
        const scaled = Utils.calculateScaledSize(width, height, maxWidth, maxHeight);

        const thumbnailsHTML = AppState.project.slides.map((slide, index) => {
            const isSelected = slide.id === AppState.selectedSlideId;
            const thumbScale = 120 / width;
            const thumbHeight = height * thumbScale;
            
            return `
                <div class="slide-thumbnail ${isSelected ? 'selected' : ''}" 
                     onclick="SlideManager.selectSlide('${slide.id}')"
                     data-slide-thumb="${slide.id}">
                    <div class="thumb-number">${index + 1}</div>
                    <div class="thumb-preview" style="width: 120px; height: ${thumbHeight}px;"></div>
                </div>
            `;
        }).join('');

        const currentSlide = AppState.project.slides.find(s => s.id === AppState.selectedSlideId);
        const currentIndex = AppState.project.slides.findIndex(s => s.id === AppState.selectedSlideId);

        let mainSlideHTML = '';
        if (currentSlide) {
            mainSlideHTML = `
                <div class="slide-frame mx-auto" style="width:${scaled.width}px;height:${scaled.height}px;" data-slide-id="${currentSlide.id}"></div>
                <div class="slide-info text-center mt-3">
                    <span class="text-secondary small">${currentSlide.source || 'HTML Content'}</span>
                </div>
            `;
        } else {
            mainSlideHTML = `
                <div class="empty-state text-center py-5">
                    <div class="mb-4" style="font-size: 64px; opacity: 0.3;">📑</div>
                    <h4 class="text-secondary mb-3">No slides yet</h4>
                    <button onclick="Modal.show('addSlide')" class="btn btn-primary">
                        <span class="me-2">+</span> Add Your First Slide
                    </button>
                </div>
            `;
        }

        const slideActionsHTML = currentSlide ? `
            <div class="slide-actions d-flex gap-2 justify-content-center mt-3">
                <button onclick="SlideManager.editSlide('${currentSlide.id}')" class="btn btn-sm btn-outline-light" title="Replace content">
                    📝 Edit
                </button>
                <button onclick="SlideManager.duplicateSlide('${currentSlide.id}')" class="btn btn-sm btn-outline-light" title="Duplicate slide">
                    📋 Duplicate
                </button>
                ${currentIndex > 0 ? `<button onclick="SlideManager.moveSlide('${currentSlide.id}', 'up')" class="btn btn-sm btn-outline-secondary" title="Move up">↑</button>` : ''}
                ${currentIndex < AppState.project.slides.length - 1 ? `<button onclick="SlideManager.moveSlide('${currentSlide.id}', 'down')" class="btn btn-sm btn-outline-secondary" title="Move down">↓</button>` : ''}
                <button onclick="SlideManager.removeSlide('${currentSlide.id}')" class="btn btn-sm btn-outline-danger" title="Delete slide">
                    🗑️
                </button>
            </div>
        ` : '';

        return `
            <nav class="navbar navbar-dark bg-dark border-bottom border-secondary fixed-top">
                <div class="container-fluid px-3">
                    <div class="d-flex align-items-center gap-3">
                        <button onclick="EventHandlers.goToMainPage()" class="btn btn-outline-secondary btn-sm" title="Back to home">
                            ← Home
                        </button>
                        <div class="vr text-secondary"></div>
                        <div>
                            <div class="fw-semibold">${AppState.project.name}</div>
                            <div class="text-secondary" style="font-size:.75rem;">${name} • ${width}×${height} • ${AppState.project.slides.length} slides</div>
                        </div>
                        <button onclick="Modal.show('projectSettings')" class="btn btn-sm btn-link text-secondary p-0 ms-1" title="Project settings">
                            ⚙️
                        </button>
                    </div>

                    <div class="d-flex align-items-center gap-2">
                        <button onclick="Modal.show('shortcuts')" class="btn btn-outline-secondary btn-sm" title="Keyboard shortcuts">
                            ⌨️
                        </button>
                        <button onclick="EventHandlers.startPresentation(true)" class="btn btn-success btn-sm" title="Start presentation (F5)">
                            ▶️ Present
                        </button>
                        <div class="vr text-secondary mx-1"></div>
                        <button onclick="ExportManager.exportProject()" class="btn btn-outline-light btn-sm">
                            💾 Save
                        </button>
                        <button onclick="ExportManager.exportAsPDF()" class="btn btn-danger btn-sm">
                            📄 PDF
                        </button>
                    </div>
                </div>
            </nav>

            <div class="app-layout">
                <div class="sidebar-left">
                    <div class="sidebar-header">
                        <span class="fw-medium">Slides</span>
                        <button onclick="Modal.show('addSlide')" class="btn btn-sm btn-primary" title="Add slide">+</button>
                    </div>
                    <div class="thumbnails-container">
                        ${thumbnailsHTML}
                        <div class="add-slide-thumb" onclick="Modal.show('addSlide')">
                            <span>+ Add Slide</span>
                        </div>
                    </div>
                </div>

                <div class="main-canvas">
                    ${mainSlideHTML}
                    ${slideActionsHTML}
                </div>
            </div>

            ${Modal.renderAddSlideModal()}
            ${Modal.renderProjectSettingsModal()}
            ${Modal.renderKeyboardShortcutsModal()}
        `;
    },

    renderPresentation() {
        const app = document.getElementById('app');
        const { width, height } = AppState.project.slideSize;
        const slide = AppState.project.slides[AppState.presentation.currentSlide];
        const total = AppState.project.slides.length;
        const current = AppState.presentation.currentSlide + 1;

        app.innerHTML = `
            <div class="presentation-mode">
                <div class="presentation-slide" data-pres-slide="${slide.id}"></div>
                
                <div class="presentation-controls">
                    <button onclick="EventHandlers.prevSlide()" class="btn btn-dark btn-sm" ${current === 1 ? 'disabled' : ''}>
                        ← Prev
                    </button>
                    <span class="text-light mx-3">${current} / ${total}</span>
                    <button onclick="EventHandlers.nextSlide()" class="btn btn-dark btn-sm" ${current === total ? 'disabled' : ''}>
                        Next →
                    </button>
                    <button onclick="EventHandlers.exitPresentation()" class="btn btn-outline-light btn-sm ms-4">
                        ✕ Exit
                    </button>
                </div>
            </div>
        `;

        const container = document.querySelector('[data-pres-slide]');
        if (container && slide) {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight - 60;
            const scale = Math.min(viewportWidth / width, viewportHeight / height);
            
            const iframe = document.createElement('iframe');
            iframe.style.cssText = `width:${width}px;height:${height}px;border:none;transform:scale(${scale});transform-origin:center center;`;
            container.style.cssText = `width:${width * scale}px;height:${height * scale}px;`;
            container.appendChild(iframe);
            
            iframe.contentDocument.open();
            iframe.contentDocument.write(slide.content);
            iframe.contentDocument.close();
        }
    },

    initSamplePreviews() {
        setTimeout(() => {
            SampleSlides.templates.forEach((sample, index) => {
                const container = document.querySelector(`[data-sample-index="${index}"]`);
                if (!container || !sample.slides[0]) return;

                const firstSlide = sample.slides[0];
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;
                const scale = Math.min(containerWidth / sample.slideSize.width, containerHeight / sample.slideSize.height);

                const iframe = document.createElement('iframe');
                iframe.style.cssText = `width:${sample.slideSize.width}px;height:${sample.slideSize.height}px;border:none;transform:scale(${scale});transform-origin:top left;`;
                container.appendChild(iframe);
                
                iframe.contentDocument.open();
                iframe.contentDocument.write(firstSlide.content);
                iframe.contentDocument.close();
            });
        }, 50);
    },

    initSlideIframes() {
        setTimeout(() => {
            const currentSlide = AppState.project.slides.find(s => s.id === AppState.selectedSlideId);
            if (currentSlide) {
                const container = document.querySelector(`[data-slide-id="${currentSlide.id}"]`);
                if (container) {
                    const iframe = document.createElement('iframe');
                    iframe.style.cssText = 'width:100%;height:100%;border:none;';
                    container.innerHTML = '';
                    container.appendChild(iframe);
                    
                    iframe.contentDocument.open();
                    iframe.contentDocument.write(currentSlide.content);
                    iframe.contentDocument.close();
                }
            }

            AppState.project.slides.forEach(slide => {
                const thumbContainer = document.querySelector(`[data-slide-thumb="${slide.id}"] .thumb-preview`);
                if (!thumbContainer) return;

                const { width, height } = AppState.project.slideSize;
                const thumbWidth = 120;
                const scale = thumbWidth / width;

                const iframe = document.createElement('iframe');
                iframe.style.cssText = `width:${width}px;height:${height}px;border:none;transform:scale(${scale});transform-origin:top left;pointer-events:none;`;
                thumbContainer.innerHTML = '';
                thumbContainer.appendChild(iframe);
                
                iframe.contentDocument.open();
                iframe.contentDocument.write(slide.content);
                iframe.contentDocument.close();
            });
        }, 50);
    }
};
