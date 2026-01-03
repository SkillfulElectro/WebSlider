const Modal = {
    show(modalId) {
        AppState.modals[modalId] = true;
        Renderer.render();
    },

    hide(modalId) {
        AppState.modals[modalId] = false;
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

        return `
            <div class="modal-overlay" onclick="Modal.hide('addSlide')">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <h2 class="text-2xl font-bold mb-6 text-center">Add New Slide</h2>
                    
                    <div class="flex flex-col gap-6">
                        <div class="upload-area" onclick="document.getElementById('htmlFileInput').click()">
                            <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                            </svg>
                            <p class="text-gray-300">Upload HTML File</p>
                            <p class="text-sm text-gray-500 mt-1">Click to browse</p>
                            <input type="file" id="htmlFileInput" accept=".html,.htm" style="display:none;" onchange="EventHandlers.onHtmlFileUpload(event)">
                        </div>
                        
                        <div class="divider">
                            <hr><span>OR</span><hr>
                        </div>
                        
                        <div>
                            <label class="text-sm font-medium mb-2" style="display:block;">Web Page URL</label>
                            <input type="url" id="slideUrl" placeholder="https://example.com/slide.html">
                            <p class="text-xs text-gray-500 mt-2">Note: URL must allow iframe embedding</p>
                        </div>
                        
                        <div class="flex gap-4">
                            <button onclick="Modal.hide('addSlide')" class="btn btn-secondary flex-1">Cancel</button>
                            <button onclick="EventHandlers.addSlideFromUrl()" class="btn btn-primary flex-1" style="background: #16a34a;">Add from URL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
