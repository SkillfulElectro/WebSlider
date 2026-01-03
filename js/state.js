const SlideManager = {
    addSlide(content, type = 'html', source = '') {
        const slide = {
            id: Utils.generateId(),
            content,
            type,
            source
        };
        AppState.project.slides.push(slide);
        Renderer.render();
    },

    removeSlide(slideId) {
        AppState.project.slides = AppState.project.slides.filter(s => s.id !== slideId);
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
    }
};
