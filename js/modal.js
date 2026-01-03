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
            <div class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center z-50" onclick="Modal.hide('newProject')">
                <div class="modal-content bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl" onclick="event.stopPropagation()">
                    <h2 class="text-2xl font-bold mb-6 text-center">Create New Project</h2>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Project Name</label>
                            <input type="text" id="projectName" value="My Presentation" 
                                class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Slide Size Preset</label>
                            <select id="sizePreset" onchange="EventHandlers.onPresetChange()"
                                class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                ${presetsHTML}
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Width (px)</label>
                                <input type="number" id="slideWidth" value="${PRESET_SIZES[0].width}"
                                    class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Height (px)</label>
                                <input type="number" id="slideHeight" value="${PRESET_SIZES[0].height}"
                                    class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                        </div>
                        
                        <div class="flex gap-4 mt-6">
                            <button onclick="Modal.hide('newProject')"
                                class="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition">
                                Cancel
                            </button>
                            <button onclick="EventHandlers.createNewProject()"
                                class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderAddSlideModal() {
        if (!AppState.modals.addSlide) return '';

        return `
            <div class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center z-50" onclick="Modal.hide('addSlide')">
                <div class="modal-content bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl" onclick="event.stopPropagation()">
                    <h2 class="text-2xl font-bold mb-6 text-center">Add New Slide</h2>
                    
                    <div class="space-y-6">
                        <div class="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer"
                            onclick="document.getElementById('htmlFileInput').click()">
                            <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                            </svg>
                            <p class="text-gray-300">Upload HTML File</p>
                            <p class="text-sm text-gray-500 mt-1">Click to browse</p>
                            <input type="file" id="htmlFileInput" accept=".html,.htm" class="hidden" onchange="EventHandlers.onHtmlFileUpload(event)">
                        </div>
                        
                        <div class="flex items-center gap-4">
                            <hr class="flex-1 border-gray-600">
                            <span class="text-gray-400">OR</span>
                            <hr class="flex-1 border-gray-600">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Web Page URL</label>
                            <input type="url" id="slideUrl" placeholder="https://example.com/slide.html"
                                class="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            <p class="text-xs text-gray-500 mt-2">Note: URL must allow iframe embedding</p>
                        </div>
                        
                        <div class="flex gap-4">
                            <button onclick="Modal.hide('addSlide')"
                                class="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition">
                                Cancel
                            </button>
                            <button onclick="EventHandlers.addSlideFromUrl()"
                                class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition">
                                Add from URL
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
