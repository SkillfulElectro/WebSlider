const SlideManager = {
    addSlide(content, type = 'html', source = '') {
        const slide = {
            id: Utils.generateId(),
            content,
            type,
            source
        };
        AppState.project.slides.push(slide);
        AppState.selectedSlideId = slide.id;
        Renderer.render();
    },

    removeSlide(slideId) {
        const index = AppState.project.slides.findIndex(s => s.id === slideId);
        AppState.project.slides = AppState.project.slides.filter(s => s.id !== slideId);
        
        if (AppState.selectedSlideId === slideId) {
            const slides = AppState.project.slides;
            if (slides.length > 0) {
                AppState.selectedSlideId = slides[Math.min(index, slides.length - 1)].id;
            } else {
                AppState.selectedSlideId = null;
            }
        }
        Renderer.render();
    },

    moveSlide(slideId, direction) {
        const slides = AppState.project.slides;
        const index = slides.findIndex(s => s.id === slideId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= slides.length) return;

        [slides[index], slides[newIndex]] = [slides[newIndex], slides[index]];
        Renderer.render();
    },

    duplicateSlide(slideId) {
        const slides = AppState.project.slides;
        const index = slides.findIndex(s => s.id === slideId);
        if (index === -1) return;

        const original = slides[index];
        const duplicate = {
            id: Utils.generateId(),
            content: original.content,
            type: original.type,
            source: original.source + ' (copy)'
        };

        slides.splice(index + 1, 0, duplicate);
        AppState.selectedSlideId = duplicate.id;
        Renderer.render();
    },

    editSlide(slideId) {
        AppState.editingSlideId = slideId;
        Modal.show('addSlide');
    },

    updateSlide(slideId, content, source) {
        const slide = AppState.project.slides.find(s => s.id === slideId);
        if (slide) {
            slide.content = content;
            slide.source = source;
            slide.type = 'html';
        }
        AppState.editingSlideId = null;
        Modal.hide('addSlide');
    },

    selectSlide(slideId) {
        AppState.selectedSlideId = slideId;
        Renderer.render();
    },

    getSelectedIndex() {
        return AppState.project.slides.findIndex(s => s.id === AppState.selectedSlideId);
    }
};
