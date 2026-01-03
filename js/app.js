document.addEventListener('DOMContentLoaded', () => {
    Renderer.render();
});

window.addEventListener('resize', () => {
    if (AppState.currentPage === 'slider') {
        Renderer.render();
    }
});
