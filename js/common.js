const PRESET_SIZES = [
    { name: 'PowerPoint 16:9', width: 1280, height: 720 },
    { name: 'PowerPoint 4:3', width: 1024, height: 768 },
    { name: 'A4 Portrait', width: 794, height: 1123 },
    { name: 'A4 Landscape', width: 1123, height: 794 },
    { name: 'Letter Portrait', width: 816, height: 1056 },
    { name: 'Letter Landscape', width: 1056, height: 816 },
    { name: 'HD 1080p', width: 1920, height: 1080 },
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Custom', width: 800, height: 600 }
];

const STORAGE_KEY = 'webslider_project';

const Storage = {
    save(project) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    },

    load() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    clear() {
        localStorage.removeItem(STORAGE_KEY);
    }
};

const Utils = {
    generateId() {
        return 'slide_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    downloadFile(content, filename, type = 'application/json') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    calculateScaledSize(originalWidth, originalHeight, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
        return {
            width: originalWidth * ratio,
            height: originalHeight * ratio,
            scale: ratio
        };
    },

    populatePresetSelect(selectId, selectedName = null) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = PRESET_SIZES.map((size, index) => {
            const selected = selectedName === size.name ? 'selected' : '';
            return `<option value="${index}" ${selected}>${size.name} (${size.width}×${size.height})</option>`;
        }).join('');
    },

    getUrlParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }
};