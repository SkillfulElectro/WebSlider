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

        const sanitizeOklchColors = (doc, root) => {
            const win = doc.defaultView;
            if (!win) return;

            const probe = doc.createElement('div');
            probe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;';
            doc.body.appendChild(probe);

            const toRgb = (val) => {
                try {
                    probe.style.color = '';
                    probe.style.color = val;
                    return win.getComputedStyle(probe).color || val;
                } catch {
                    return val;
                }
            };

            const props = [
                'color', 'backgroundColor', 'borderTopColor', 'borderRightColor',
                'borderBottomColor', 'borderLeftColor', 'outlineColor', 
                'textDecorationColor', 'caretColor'
            ];

            root.querySelectorAll('*').forEach(el => {
                const cs = win.getComputedStyle(el);
                props.forEach(prop => {
                    const val = cs[prop];
                    if (typeof val === 'string' && val.includes('oklch(')) {
                        el.style[prop] = toRgb(val);
                    }
                });
            });

            doc.body.removeChild(probe);
        };

        try {
            captureHost.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;z-index:9998;overflow:hidden;background:#ffffff;`;

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

                sanitizeOklchColors(doc, doc.body);
                await wait(100);

                const dataUrl = await htmlToImage.toPng(doc.body, {
                    canvasWidth: width,
                    canvasHeight: height,
                    pixelRatio: 2,
                    useCorsCredentials: true,
                    backgroundColor: '#ffffff'
                });

                if (i > 0) pdf.addPage([width, height], orientation);
                pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
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
