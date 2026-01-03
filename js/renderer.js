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
                <div class="text-center mb-5 pt-2">
                    <h1 class="display-3 fw-bold gradient-text mb-2">WebSlider</h1>
                    <p class="lead text-secondary">Create stunning slides with Web technologies</p>
                </div>

                <div class="d-flex gap-3 justify-content-center flex-wrap mb-5">
                    <button onclick="EventHandlers.onImportProject()" class="btn btn-outline-light px-4 py-2">
                        <span class="me-2">⬆</span>
                        Import Project
                    </button>

                    <button onclick="Modal.show('newProject')" class="btn btn-primary px-4 py-2">
                        <span class="me-2">＋</span>
                        Create New Project
                    </button>
                </div>

                <div class="mx-auto" style="max-width: 1100px;">
                    <h2 class="h4 fw-semibold text-center text-secondary mb-3">Or start with a template</h2>
                    <div class="row row-cols-1 row-cols-md-3 g-3">
                        ${samplesHTML}
                    </div>
                </div>

                <div class="text-center text-secondary mt-5" style="font-size:.9rem;">Supports .webslider project files</div>
            </div>

            ${Modal.renderNewProjectModal()}
        `;
    },

    renderSliderPage() {
        const { width, height, name } = AppState.project.slideSize;
        const maxWidth = Math.min(window.innerWidth - 48, 980);
        const maxHeight = window.innerHeight - 220;
        const scaled = Utils.calculateScaledSize(width, height, maxWidth, maxHeight);

        const slidesHTML = AppState.project.slides.map((slide, index) => `
            <div class="d-flex flex-column align-items-center gap-2 mb-4">
                <div class="position-relative group">
                    <div class="position-absolute" style="top:-28px;left:0;font-size:.85rem;color:#9ca3af;font-weight:600;">
                        Slide ${index + 1}
                    </div>

                    <div class="slide-frame" style="width:${scaled.width}px;height:${scaled.height}px;" data-slide-id="${slide.id}"></div>

                    <div class="slide-controls position-absolute top-50 translate-middle-y" style="right:-54px;">
                        <div class="d-flex flex-column gap-2 opacity-0 group-hover-opacity-100 transition">
                            ${index > 0 ? `<button onclick="SlideManager.moveSlide('${slide.id}', 'up')" class="btn btn-sm btn-secondary" title="Move up">▲</button>` : ''}
                            ${index < AppState.project.slides.length - 1 ? `<button onclick="SlideManager.moveSlide('${slide.id}', 'down')" class="btn btn-sm btn-secondary" title="Move down">▼</button>` : ''}
                            <button onclick="SlideManager.removeSlide('${slide.id}')" class="btn btn-sm btn-danger" title="Delete">✕</button>
                        </div>
                    </div>
                </div>

                <div class="text-secondary text-truncate" style="max-width: 260px; font-size:.8rem;" title="${slide.source}">
                    ${slide.type === 'url' ? '🔗 ' : '📄 '}${slide.source || 'HTML Content'}
                </div>
            </div>
        `).join('');

        return `
            <nav class="navbar navbar-dark bg-dark border-bottom border-secondary fixed-top">
                <div class="container-fluid">
                    <div class="d-flex align-items-center gap-3">
                        <button onclick="EventHandlers.goToMainPage()" class="btn btn-outline-light btn-sm" title="Back">←</button>
                        <div>
                            <div class="fw-semibold">${AppState.project.name}</div>
                            <div class="text-secondary" style="font-size:.8rem;">${name} • ${width}×${height}px • ${AppState.project.slides.length} slides</div>
                        </div>
                    </div>

                    <div class="d-flex align-items-center gap-2">
                        <button onclick="ExportManager.exportProject()" class="btn btn-outline-light btn-sm">Export (.webslider)</button>
                        <button onclick="ExportManager.exportAsPDF()" class="btn btn-danger btn-sm">Export PDF</button>
                    </div>
                </div>
            </nav>

            <div class="container-fluid" style="padding-top: 84px; padding-bottom: 40px;">
                <div class="d-flex flex-column align-items-center">
                    ${slidesHTML}

                    <button onclick="Modal.show('addSlide')" class="add-slide-btn" style="width:${scaled.width}px;height:${scaled.height}px;">
                        <div class="text-center text-secondary">
                            <div style="font-size:64px; line-height: 1;">+</div>
                            <div class="fw-semibold">Add New Slide</div>
                            <div style="font-size:.9rem;">Upload HTML or enter URL</div>
                        </div>
                    </button>
                </div>
            </div>

            ${Modal.renderAddSlideModal()}
        `;
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
            AppState.project.slides.forEach(slide => {
                const container = document.querySelector(`[data-slide-id="${slide.id}"]`);
                if (!container) return;

                if (slide.type === 'url') {
                    const iframe = document.createElement('iframe');
                    iframe.src = slide.source;
                    iframe.referrerPolicy = 'no-referrer';
                    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
                    iframe.style.cssText = 'width:100%;height:100%;border:none;';
                    container.innerHTML = '';
                    container.appendChild(iframe);
                } else {
                    const iframe = document.createElement('iframe');
                    iframe.style.cssText = 'width:100%;height:100%;border:none;';
                    container.innerHTML = '';
                    container.appendChild(iframe);
                    
                    iframe.contentDocument.open();
                    iframe.contentDocument.write(slide.content);
                    iframe.contentDocument.close();
                }
            });
        }, 50);
    }
};
