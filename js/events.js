const EventHandlers = {
    onPresetChange() {
        const select = document.getElementById('sizePreset');
        const preset = PRESET_SIZES[select.value];
        document.getElementById('slideWidth').value = preset.width;
        document.getElementById('slideHeight').value = preset.height;
    },

    onEditPresetChange() {
        const select = document.getElementById('editSizePreset');
        const preset = PRESET_SIZES[select.value];
        document.getElementById('editSlideWidth').value = preset.width;
        document.getElementById('editSlideHeight').value = preset.height;
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
        AppState.selectedSlideId = null;
        Modal.hide('newProject');
    },

    saveProjectSettings() {
        const name = document.getElementById('editProjectName').value || 'Untitled Project';
        const width = parseInt(document.getElementById('editSlideWidth').value) || 1280;
        const height = parseInt(document.getElementById('editSlideHeight').value) || 720;
        const presetIndex = document.getElementById('editSizePreset').value;

        AppState.project.name = name;
        AppState.project.slideSize = { width, height, name: PRESET_SIZES[presetIndex].name };
        
        Modal.hide('projectSettings');
    },

    async onHtmlFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const content = await Utils.readFileAsText(file);
            
            if (AppState.editingSlideId) {
                SlideManager.updateSlide(AppState.editingSlideId, content, file.name);
            } else {
                SlideManager.addSlide(content, 'html', file.name);
                Modal.hide('addSlide');
            }
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
        
        event.target.value = '';
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
        if (AppState.project.slides.length === 0 || confirm('Go back? Unsaved changes will be lost.')) {
            AppState.currentPage = 'main';
            Renderer.render();
        }
    },

    startPresentation(fromBeginning = true) {
        if (AppState.project.slides.length === 0) {
            alert('Add at least one slide to start presentation.');
            return;
        }

        AppState.presentation.active = true;
        AppState.presentation.currentSlide = fromBeginning ? 0 : Math.max(0, SlideManager.getSelectedIndex());
        Renderer.renderPresentation();
    },

    exitPresentation() {
        AppState.presentation.active = false;
        Renderer.render();
    },

    nextSlide() {
        if (AppState.presentation.currentSlide < AppState.project.slides.length - 1) {
            AppState.presentation.currentSlide++;
            Renderer.renderPresentation();
        }
    },

    prevSlide() {
        if (AppState.presentation.currentSlide > 0) {
            AppState.presentation.currentSlide--;
            Renderer.renderPresentation();
        }
    },

    handleKeydown(e) {
        if (AppState.presentation.active) {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    EventHandlers.nextSlide();
                    break;
                case 'ArrowLeft':
                case 'Backspace':
                    e.preventDefault();
                    EventHandlers.prevSlide();
                    break;
                case 'Escape':
                    EventHandlers.exitPresentation();
                    break;
                case 'Home':
                    AppState.presentation.currentSlide = 0;
                    Renderer.renderPresentation();
                    break;
                case 'End':
                    AppState.presentation.currentSlide = AppState.project.slides.length - 1;
                    Renderer.renderPresentation();
                    break;
            }
            return;
        }

        if (AppState.currentPage === 'slider') {
            if (e.key === 'F5') {
                e.preventDefault();
                EventHandlers.startPresentation(!e.shiftKey);
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                ExportManager.exportProject();
            }
        }
    }
};

document.addEventListener('keydown', EventHandlers.handleKeydown);
