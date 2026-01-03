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
            <div class="sample-card bg-gray-800 rounded-xl overflow-hidden cursor-pointer border border-gray-700 hover:border-blue-500"
                onclick="SampleSlides.loadSample(${index})">
                <div class="sample-preview h-40 bg-gray-900" data-sample-index="${index}"></div>
                <div class="p-4">
                    <h3 class="font-bold text-lg">${sample.name}</h3>
                    <p class="text-sm text-gray-400 mt-1">${sample.description}</p>
                    <p class="text-xs text-gray-500 mt-2">${sample.slides.length} slides • ${sample.slideSize.name}</p>
                </div>
            </div>
        `).join('');

        return `
            <div class="min-h-screen flex flex-col items-center p-8">
                <div class="text-center mb-12 pt-8">
                    <h1 class="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                        WebSlider
                    </h1>
                    <p class="text-xl text-gray-400">Create stunning slides with Web technologies</p>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-6 mb-16">
                    <button onclick="EventHandlers.onImportProject()"
                        class="group px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition border border-gray-700 hover:border-gray-600 flex items-center gap-3">
                        <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        Import Project
                    </button>
                    
                    <button onclick="Modal.show('newProject')"
                        class="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-lg transition flex items-center gap-3 shadow-lg shadow-blue-500/25">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Create New Project
                    </button>
                </div>
                
                <div class="w-full max-w-5xl">
                    <h2 class="text-2xl font-bold mb-6 text-center text-gray-300">Or start with a template</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${samplesHTML}
                    </div>
                </div>
                
                <p class="mt-12 text-gray-600 text-sm">Supports .webslider project files</p>
            </div>
            
            ${Modal.renderNewProjectModal()}
        `;
    },

    renderSliderPage() {
        const { width, height, name } = AppState.project.slideSize;
        const maxWidth = Math.min(window.innerWidth - 100, 900);
        const maxHeight = window.innerHeight - 250;
        const scaled = Utils.calculateScaledSize(width, height, maxWidth, maxHeight);

        const slidesHTML = AppState.project.slides.map((slide, index) => `
            <div class="flex flex-col items-center gap-3 flex-shrink-0">
                <div class="relative group">
                    <div class="absolute -top-8 left-0 text-sm text-gray-400 font-medium">
                        Slide ${index + 1}
                    </div>
                    
                    <div class="slide-frame rounded-lg" 
                        style="width: ${scaled.width}px; height: ${scaled.height}px;"
                        data-slide-id="${slide.id}">
                    </div>
                    
                    <div class="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${index > 0 ? `
                            <button onclick="SlideManager.moveSlide('${slide.id}', 'up')" 
                                class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition" title="Move up">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                                </svg>
                            </button>
                        ` : ''}
                        ${index < AppState.project.slides.length - 1 ? `
                            <button onclick="SlideManager.moveSlide('${slide.id}', 'down')" 
                                class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition" title="Move down">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button onclick="SlideManager.removeSlide('${slide.id}')" 
                            class="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition" title="Delete">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <p class="text-xs text-gray-500 truncate max-w-[200px]" title="${slide.source}">
                    ${slide.type === 'url' ? '🔗 ' : '📄 '}${slide.source || 'HTML Content'}
                </p>
            </div>
        `).join('');

        return `
            <nav class="fixed top-0 left-0 right-0 bg-gray-800/95 backdrop-blur border-b border-gray-700 z-40">
                <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <button onclick="EventHandlers.goToMainPage()" 
                            class="p-2 hover:bg-gray-700 rounded-lg transition" title="Back">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                        </button>
                        <div>
                            <h1 class="font-bold text-lg">${AppState.project.name}</h1>
                            <p class="text-xs text-gray-400">${name} • ${width}×${height}px • ${AppState.project.slides.length} slides</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <button onclick="ExportManager.exportProject()"
                            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                            </svg>
                            Export
                        </button>
                        <button onclick="ExportManager.exportAsPDF()"
                            class="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                            </svg>
                            PDF
                        </button>
                    </div>
                </div>
            </nav>
            
            <div class="pt-24 pb-8 px-4 min-h-screen">
                <div class="flex flex-col items-center gap-12 py-8">
                    ${slidesHTML}
                    
                    <button onclick="Modal.show('addSlide')"
                        class="add-slide-btn rounded-lg flex items-center justify-center cursor-pointer"
                        style="width: ${scaled.width}px; height: ${scaled.height}px;">
                        <div class="text-center text-gray-400">
                            <svg class="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            <p class="text-lg font-medium">Add New Slide</p>
                            <p class="text-sm mt-1">Upload HTML or enter URL</p>
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
