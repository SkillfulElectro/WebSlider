const EventHandlers = {
    onPresetChange() {
        const select = document.getElementById('sizePreset');
        const preset = PRESET_SIZES[select.value];
        document.getElementById('slideWidth').value = preset.width;
        document.getElementById('slideHeight').value = preset.height;
    },

    createNewProject() {
        const name = document.getElementById('projectName').value || 'Untitled Project';
        const width = parseInt(document.getElementById('slideWidth').value) || 1280;
        const height = parseInt(document.getElementById('slideHeight').value) || 720;
        const presetIndex = document.getElementById('sizePreset').value;

        AppState.project = {
            name,
            slideSize: { width, height, name: PRESET_SIZES[presetIndex].name },
            slides: []
        };
        
        AppState.currentPage = 'slider';
        Modal.hide('newProject');
    },

    async onHtmlFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const content = await Utils.readFileAsText(file);
            SlideManager.addSlide(content, 'html', file.name);
            Modal.hide('addSlide');
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    },

    addSlideFromUrl() {
        const url = document.getElementById('slideUrl').value.trim();
        if (!url) {
            alert('Please enter a valid URL');
            return;
        }
        SlideManager.addSlide('', 'url', url);
        Modal.hide('addSlide');
    },

    async onImportProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.webslider';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) ExportManager.importProject(file);
        };
        input.click();
    },

    goToMainPage() {
        if (confirm('Go back? Unsaved changes will be lost.')) {
            AppState.currentPage = 'main';
            Renderer.render();
        }
    }
};
