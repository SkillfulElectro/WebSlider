document.addEventListener('DOMContentLoaded', () => {
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

    // Initialize sample previews
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
            
            iframe.contentDocument.open();
            iframe.contentDocument.write(sample.slides[0].content);
            iframe.contentDocument.close();
        });
    }, 100);
}

function setupEventListeners() {
    // Preset change
    document.getElementById('sizePreset').addEventListener('change', (e) => {
        const preset = PRESET_SIZES[e.target.value];
        document.getElementById('slideWidth').value = preset.width;
        document.getElementById('slideHeight').value = preset.height;
    });

    // Create new project
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

    // Import project
    document.getElementById('btnImport').addEventListener('click', () => {
        document.getElementById('importInput').click();
    });

    document.getElementById('importInput').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const content = await Utils.readFileAsText(file);
            const project = JSON.parse(content);

            if (!project.slideSize || !Array.isArray(project.slides)) {
                throw new Error('Invalid project file format');
            }

            Storage.save(project);
            window.location.href = 'editor.html';
        } catch (error) {
            alert('Error importing project: ' + error.message);
        }

        e.target.value = '';
    });

    // Sample cards
    document.getElementById('samplesGrid').addEventListener('click', (e) => {
        const card = e.target.closest('[data-sample]');
        if (!card) return;

        const index = parseInt(card.dataset.sample);
        const sample = SampleSlides.templates[index];

        const project = {
            name: sample.name,
            slideSize: { ...sample.slideSize },
            slides: sample.slides.map(s => ({
                ...s,
                id: Utils.generateId()
            }))
        };

        Storage.save(project);
        window.location.href = 'editor.html';
    });
}