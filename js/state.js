const AppState = {
    currentPage: 'main',
    project: {
        name: 'Untitled Project',
        slideSize: { width: 1280, height: 720, name: 'PowerPoint 16:9' },
        slides: []
    },
    modals: {
        newProject: false,
        addSlide: false
    }
};

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
