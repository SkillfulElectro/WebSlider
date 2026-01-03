const Modal = {
    show(modalId) {
        AppState.modals[modalId] = true;
        Renderer.render();
    },

    hide(modalId) {
        AppState.modals[modalId] = false;
        if (modalId === 'addSlide') {
            AppState.editingSlideId = null;
        }
        Renderer.render();
    },

    renderNewProjectModal() {
        if (!AppState.modals.newProject) return '';

        const presetsHTML = PRESET_SIZES.map((size, index) => 
            `<option value="${index}">${size.name} (${size.width}×${size.height})</option>`
        ).join('');

        return `
            <div class="modal-overlay" onclick="Modal.hide('newProject')">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h5 class="mb-0">Create New Project</h5>
                        <button class="btn btn-sm btn-outline-light" onclick="Modal.hide('newProject')">✕</button>
                    </div>

                    <div class="vstack gap-3">
                        <div>
                            <label class="form-label">Project Name</label>
                            <input class="form-control" type="text" id="projectName" value="My Presentation">
                        </div>

                        <div>
                            <label class="form-label">Slide Size Preset</label>
                            <select class="form-select" id="sizePreset" onchange="EventHandlers.onPresetChange()">
                                ${presetsHTML}
                            </select>
                        </div>

                        <div class="row g-3">
                            <div class="col-6">
                                <label class="form-label">Width (px)</label>
                                <input class="form-control" type="number" id="slideWidth" value="${PRESET_SIZES[0].width}">
                            </div>
                            <div class="col-6">
                                <label class="form-label">Height (px)</label>
                                <input class="form-control" type="number" id="slideHeight" value="${PRESET_SIZES[0].height}">
                            </div>
                        </div>

                        <div class="d-flex gap-2 pt-2">
                            <button onclick="Modal.hide('newProject')" class="btn btn-outline-light w-50">Cancel</button>
                            <button onclick="EventHandlers.createNewProject()" class="btn btn-primary w-50">Create</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderAddSlideModal() {
        if (!AppState.modals.addSlide) return '';

        const isEditing = AppState.editingSlideId !== null;
        const title = isEditing ? 'Replace Slide Content' : 'Add New Slide';

        return `
            <div class="modal-overlay" onclick="Modal.hide('addSlide')">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <h5 class="mb-0">${title}</h5>
                        <button class="btn btn-sm btn-outline-light" onclick="Modal.hide('addSlide')">✕</button>
                    </div>
                    
                    <div class="upload-area mb-4" onclick="document.getElementById('htmlFileInput').click()">
                        <div class="text-center py-4">
                            <div class="upload-icon mb-3">
                                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin: 0 auto; opacity: 0.6;">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                </svg>
                            </div>
                            <p class="mb-1 fw-medium">Drop HTML file here or click to browse</p>
                            <p class="text-secondary small mb-0">Supports .html and .htm files</p>
                        </div>
                        <input type="file" id="htmlFileInput" accept=".html,.htm" style="display:none;" onchange="EventHandlers.onHtmlFileUpload(event)">
                    </div>

                    <div class="d-grid">
                        <button onclick="Modal.hide('addSlide')" class="btn btn-outline-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderProjectSettingsModal() {
        if (!AppState.modals.projectSettings) return '';

        const presetsHTML = PRESET_SIZES.map((size, index) => {
            const selected = size.name === AppState.project.slideSize.name ? 'selected' : '';
            return `<option value="${index}" ${selected}>${size.name} (${size.width}×${size.height})</option>`;
        }).join('');

        return `
            <div class="modal-overlay" onclick="Modal.hide('projectSettings')">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h5 class="mb-0">Project Settings</h5>
                        <button class="btn btn-sm btn-outline-light" onclick="Modal.hide('projectSettings')">✕</button>
                    </div>

                    <div class="vstack gap-3">
                        <div>
                            <label class="form-label">Project Name</label>
                            <input class="form-control" type="text" id="editProjectName" value="${AppState.project.name}">
                        </div>

                        <div>
                            <label class="form-label">Slide Size</label>
                            <select class="form-select" id="editSizePreset" onchange="EventHandlers.onEditPresetChange()">
                                ${presetsHTML}
                            </select>
                        </div>

                        <div class="row g-3">
                            <div class="col-6">
                                <label class="form-label">Width (px)</label>
                                <input class="form-control" type="number" id="editSlideWidth" value="${AppState.project.slideSize.width}">
                            </div>
                            <div class="col-6">
                                <label class="form-label">Height (px)</label>
                                <input class="form-control" type="number" id="editSlideHeight" value="${AppState.project.slideSize.height}">
                            </div>
                        </div>

                        <div class="d-flex gap-2 pt-2">
                            <button onclick="Modal.hide('projectSettings')" class="btn btn-outline-light w-50">Cancel</button>
                            <button onclick="EventHandlers.saveProjectSettings()" class="btn btn-primary w-50">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderKeyboardShortcutsModal() {
        if (!AppState.modals.shortcuts) return '';

        const shortcuts = [
            { key: 'F5', action: 'Start presentation from beginning' },
            { key: 'Shift + F5', action: 'Start from current slide' },
            { key: '→ / Space', action: 'Next slide (presentation)' },
            { key: '← / Backspace', action: 'Previous slide (presentation)' },
            { key: 'Escape', action: 'Exit presentation mode' },
            { key: 'Ctrl + S', action: 'Save/Export project' },
        ];

        return `
            <div class="modal-overlay" onclick="Modal.hide('shortcuts')">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h5 class="mb-0">Keyboard Shortcuts</h5>
                        <button class="btn btn-sm btn-outline-light" onclick="Modal.hide('shortcuts')">✕</button>
                    </div>

                    <div class="shortcuts-list">
                        ${shortcuts.map(s => `
                            <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                                <span class="text-secondary">${s.action}</span>
                                <kbd class="bg-dark px-2 py-1 rounded small">${s.key}</kbd>
                            </div>
                        `).join('')}
                    </div>

                    <div class="d-grid mt-3">
                        <button onclick="Modal.hide('shortcuts')" class="btn btn-outline-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;
    }
};
