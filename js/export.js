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
        loadingDiv.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;color:#fff;';
        loadingDiv.innerHTML = `
            <div style="text-align:center;">
                <div style="width:64px;height:64px;border:4px solid rgba(59,130,246,1);border-top-color:transparent;border-radius:999px;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
                <p style="font-size:18px;" id="exportProgress">Exporting slide 1 of ${slides.length}...</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);

        const style = document.createElement('style');
        style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
        document.head.appendChild(style);

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
                ['color', 'color'],
                ['backgroundColor', 'backgroundColor'],
                ['borderTopColor', 'borderTopColor'],
                ['borderRightColor', 'borderRightColor'],
                ['borderBottomColor', 'borderBottomColor'],
                ['borderLeftColor', 'borderLeftColor'],
                ['outlineColor', 'outlineColor'],
                ['textDecorationColor', 'textDecorationColor'],
                ['caretColor', 'caretColor']
            ];

            const nodes = root.querySelectorAll('*');
            nodes.forEach(el => {
                const cs = win.getComputedStyle(el);
                props.forEach(([csKey, styleKey]) => {
                    const val = cs[csKey];
                    if (typeof val === 'string' && val.includes('oklch(')) {
                        el.style[styleKey] = toRgb(val);
                    }
                });

                if (el instanceof win.SVGElement) {
                    const fill = cs.fill;
                    const stroke = cs.stroke;
                    if (typeof fill === 'string' && fill.includes('oklch(')) el.style.fill = toRgb(fill);
                    if (typeof stroke === 'string' && stroke.includes('oklch(')) el.style.stroke = toRgb(stroke);
                }
            });

            doc.body.removeChild(probe);
        };

        const captureIframeDocument = async (iframe) => {
            await new Promise((resolve, reject) => {
                const t = setTimeout(() => reject(new Error('Slide load timeout')), 12000);
                const done = () => {
                    clearTimeout(t);
                    resolve();
                };
                if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') return done();
                iframe.onload = done;
                iframe.onerror = () => {
                    clearTimeout(t);
                    reject(new Error('Failed to load slide'));
                };
            });

            const doc = iframe.contentDocument;
            if (!doc || !doc.body) throw new Error('Slide document not accessible');

            try {
                if (doc.fonts && doc.fonts.ready) await doc.fonts.ready;
            } catch {}

            sanitizeOklchColors(doc, doc.body);
            await wait(60);

            return await html2canvas(doc.body, {
                width,
                height,
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false
            });
        };

        try {
            captureHost.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;z-index:9998;overflow:hidden;background:#ffffff;`;

            for (let i = 0; i < slides.length; i++) {
                const slide = slides[i];
                const progress = document.getElementById('exportProgress');
                if (progress) progress.textContent = `Exporting slide ${i + 1} of ${slides.length}...`;

                captureHost.innerHTML = '';

                let canvas;

                if (slide.type === 'html') {
                    const iframe = document.createElement('iframe');
                    iframe.style.cssText = `width:${width}px;height:${height}px;border:none;`;
                    captureHost.appendChild(iframe);

                    const doc = iframe.contentDocument;
                    doc.open();
                    doc.write(slide.content);
                    doc.close();

                    canvas = await captureIframeDocument(iframe);
                } else {
                    const iframe = document.createElement('iframe');
                    iframe.style.cssText = `width:${width}px;height:${height}px;border:none;`;
                    iframe.src = slide.source;
                    captureHost.appendChild(iframe);

                    try {
                        canvas = await captureIframeDocument(iframe);
                    } catch (e) {
                        captureHost.innerHTML = `
                            <div style="width:${width}px;height:${height}px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;">
                                <div style="text-align:center;max-width:${Math.min(width - 80, 900)}px;padding:24px;">
                                    <div style="font-size:18px;color:#111827;font-weight:600;">Unable to capture URL slide</div>
                                    <div style="margin-top:8px;font-size:13px;color:#4b5563;">${slide.source}</div>
                                    <div style="margin-top:10px;font-size:12px;color:#6b7280;">(Cross-origin pages cannot be exported as images)</div>
                                </div>
                            </div>
                        `;
                        await wait(30);
                        canvas = await html2canvas(captureHost, {
                            width,
                            height,
                            scale: 2,
                            backgroundColor: '#ffffff',
                            logging: false
                        });
                    }
                }

                if (i > 0) pdf.addPage([width, height], orientation);
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);
            }

            pdf.save(`${AppState.project.name}.pdf`);
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Error exporting PDF: ' + error.message);
        } finally {
            captureHost.innerHTML = '';
            captureHost.setAttribute('style', originalCaptureStyle);
            if (loadingDiv.parentNode) loadingDiv.parentNode.removeChild(loadingDiv);
            if (style.parentNode) style.parentNode.removeChild(style);
        }
    }
};
