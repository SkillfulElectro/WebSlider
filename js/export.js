const ExportManager = {
    exportProject() {
        const projectData = JSON.stringify(AppState.project, null, 2);
        Utils.downloadFile(projectData, `${AppState.project.name}.webslider`, 'application/json');
    },

    async importProject(file) {
        try {
            const content = await Utils.readFileAsText(file);
            const project = JSON.parse(content);
            
            if (!project.slideSize || !Array.isArray(project.slides)) {
                throw new Error('Invalid project file format');
            }
            
            AppState.project = project;
            AppState.currentPage = 'slider';
            AppState.selectedSlideId = project.slides.length > 0 ? project.slides[0].id : null;
            Renderer.render();
        } catch (error) {
            alert('Error importing project: ' + error.message);
        }
    },

    async exportAsPDF() {
        const { jsPDF } = window.jspdf;
        const { width, height } = AppState.project.slideSize;
        const orientation = width > height ? 'landscape' : 'portrait';
        const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height] });
        const slides = AppState.project.slides;

        if (slides.length === 0) {
            alert('No slides to export!');
            return;
        }

        const captureHost = document.getElementById('pdf-capture');
        if (!captureHost) {
            alert('PDF capture container not found');
            return;
        }

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'exportLoading';
        loadingDiv.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;color:#fff;';
        loadingDiv.innerHTML = `
            <div style="text-align:center;">
                <div class="spinner-border text-primary mb-3" role="status" style="width:3rem;height:3rem;"></div>
                <p style="font-size:18px;" id="exportProgress">Preparing slide 1 of ${slides.length}...</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);

        const originalCaptureStyle = captureHost.getAttribute('style') || '';
        const wait = (ms) => new Promise(r => setTimeout(r, ms));

        try {
            captureHost.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;z-index:9998;overflow:hidden;`;

            for (let i = 0; i < slides.length; i++) {
                const slide = slides[i];
                const progress = document.getElementById('exportProgress');
                if (progress) progress.textContent = `Exporting slide ${i + 1} of ${slides.length}...`;

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
                        if (doc.readyState === 'complete') {
                            resolve();
                        } else {
                            setTimeout(checkReady, 50);
                        }
                    };
                    setTimeout(checkReady, 100);
                });

                try {
                    if (doc.fonts && doc.fonts.ready) await doc.fonts.ready;
                } catch {}

                await wait(100);

                const dataUrl = await htmlToImage.toJpeg(doc.body, {
                    canvasWidth: width * 2,
                    canvasHeight: height * 2,
                    pixelRatio: 1,
                    quality: 0.85,
                    useCorsCredentials: true
                });

                if (i > 0) pdf.addPage([width, height], orientation);
                pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height);
            }

            pdf.save(`${AppState.project.name}.pdf`);
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Error exporting PDF: ' + error.message);
        } finally {
            captureHost.innerHTML = '';
            captureHost.setAttribute('style', originalCaptureStyle);
            if (loadingDiv.parentNode) loadingDiv.parentNode.removeChild(loadingDiv);
        }
    }
};
