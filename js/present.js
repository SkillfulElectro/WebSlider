let project = null;
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', () => {
    project = Storage.load();
    
    if (!project || project.slides.length === 0) {
        window.location.href = 'editor.html';
        return;
    }

    currentSlide = parseInt(Utils.getUrlParam('slide')) || 0;
    currentSlide = Math.max(0, Math.min(currentSlide, project.slides.length - 1));

    renderSlide();
    setupEventListeners();
});

function renderSlide() {
    const container = document.getElementById('slideContainer');
    const slide = project.slides[currentSlide];
    const { width: slideWidth, height: slideHeight } = project.slideSize;
    const total = project.slides.length;

    // Calculate available space (account for controls bar)
    const controlsHeight = 58;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - controlsHeight;

    // Calculate scale to fit
    const scale = Math.min(
        viewportWidth / slideWidth,
        viewportHeight / slideHeight
    );

    const displayWidth = slideWidth * scale;
    const displayHeight = slideHeight * scale;

    // Set container size
    container.style.width = displayWidth + 'px';
    container.style.height = displayHeight + 'px';
    container.innerHTML = '';

    // Create iframe at original slide dimensions
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        width: ${slideWidth}px;
        height: ${slideHeight}px;
        transform: scale(${scale});
        transform-origin: center center;
        position: absolute;
        left: 50%;
        top: 50%;
        margin-left: -${slideWidth / 2}px;
        margin-top: -${slideHeight / 2}px;
    `;
    container.appendChild(iframe);

    // Write content
    iframe.contentDocument.open();
    iframe.contentDocument.write(slide.content);
    iframe.contentDocument.close();

    // Update counter and buttons
    document.getElementById('slideCounter').textContent = `${currentSlide + 1} / ${total}`;
    document.getElementById('btnPrev').disabled = currentSlide === 0;
    document.getElementById('btnNext').disabled = currentSlide === total - 1;
}

function nextSlide() {
    if (currentSlide < project.slides.length - 1) {
        currentSlide++;
        renderSlide();
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        renderSlide();
    }
}

function setupEventListeners() {
    document.getElementById('btnPrev').addEventListener('click', prevSlide);
    document.getElementById('btnNext').addEventListener('click', nextSlide);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
            case 'Enter':
            case 'PageDown':
                e.preventDefault();
                nextSlide();
                break;

            case 'ArrowLeft':
            case 'Backspace':
            case 'PageUp':
                e.preventDefault();
                prevSlide();
                break;

            case 'Escape':
                window.location.href = 'editor.html';
                break;

            case 'Home':
                currentSlide = 0;
                renderSlide();
                break;

            case 'End':
                currentSlide = project.slides.length - 1;
                renderSlide();
                break;

            case 'f':
            case 'F':
                toggleFullscreen();
                break;
        }
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Only trigger if horizontal swipe is larger than vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }, { passive: true });

    // Click on slide area to advance (except on controls)
    document.getElementById('slideContainer').addEventListener('click', (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        // Left third goes back, right two-thirds goes forward
        if (clickX < rect.width / 3) {
            prevSlide();
        } else {
            nextSlide();
        }
    });

    // Window resize
    window.addEventListener('resize', renderSlide);

    // Orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(renderSlide, 100);
    });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
}