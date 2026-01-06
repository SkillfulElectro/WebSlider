let project = null;
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Present mode loaded');
    
    project = Storage.load();
    
    if (!project || project.slides.length === 0) {
        console.log('No project found, redirecting to editor');
        window.location.href = 'editor.html';
        return;
    }

    console.log('Loaded project:', project.name, 'with', project.slides.length, 'slides');

    currentSlide = parseInt(Utils.getUrlParam('slide')) || 0;
    currentSlide = Math.max(0, Math.min(currentSlide, project.slides.length - 1));

    await renderSlide();
    setupEventListeners();
});

async function renderSlide() {
    const container = document.getElementById('slideContainer');
    const slide = project.slides[currentSlide];
    const { width: slideWidth, height: slideHeight } = project.slideSize;
    const total = project.slides.length;

    console.log('Rendering slide', currentSlide + 1, '/', total, 'hasAssets:', slide.hasAssets);

    const controlsHeight = 58;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - controlsHeight;

    const scale = Math.min(viewportWidth / slideWidth, viewportHeight / slideHeight);

    const displayWidth = slideWidth * scale;
    const displayHeight = slideHeight * scale;

    container.style.width = displayWidth + 'px';
    container.style.height = displayHeight + 'px';
    container.innerHTML = '';

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
        background: white;
    `;
    container.appendChild(iframe);

    let content = slide.content;
    if (slide.hasAssets) {
        console.log('Processing slide with assets...');
        content = await Utils.processHtmlWithCache(currentSlide, content);
    }

    iframe.contentDocument.open();
    iframe.contentDocument.write(content);
    iframe.contentDocument.close();

    document.getElementById('slideCounter').textContent = `${currentSlide + 1} / ${total}`;
    document.getElementById('btnPrev').disabled = currentSlide === 0;
    document.getElementById('btnNext').disabled = currentSlide === total - 1;
}

async function nextSlide() {
    if (currentSlide < project.slides.length - 1) {
        currentSlide++;
        await renderSlide();
    }
}

async function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        await renderSlide();
    }
}

function setupEventListeners() {
    document.getElementById('btnPrev').addEventListener('click', () => prevSlide());
    document.getElementById('btnNext').addEventListener('click', () => nextSlide());

    document.addEventListener('keydown', async (e) => {
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
            case 'Enter':
            case 'PageDown':
                e.preventDefault();
                await nextSlide();
                break;
            case 'ArrowLeft':
            case 'Backspace':
            case 'PageUp':
                e.preventDefault();
                await prevSlide();
                break;
            case 'Escape':
                window.location.href = 'editor.html';
                break;
            case 'Home':
                currentSlide = 0;
                await renderSlide();
                break;
            case 'End':
                currentSlide = project.slides.length - 1;
                await renderSlide();
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
        }
    });

    let touchStartX = 0, touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', async (e) => {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX < 0) {
                await nextSlide();
            } else {
                await prevSlide();
            }
        }
    }, { passive: true });

    document.getElementById('slideContainer').addEventListener('click', async (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < rect.width / 3) {
            await prevSlide();
        } else {
            await nextSlide();
        }
    });

    window.addEventListener('resize', () => renderSlide());
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
}
