/**
 * Dynamic Photo Gallery Generator
 * Automatically loads images from photos/ folder and creates gallery with modals
 */

class PhotoGallery {
    constructor() {
        this.photosFolder = 'photos/';
        this.galleryContainer = null;
        this.modalContainer = null;
    }

    /**
     * Initialize the gallery system
     */
    async init() {
        this.galleryContainer = document.querySelector('.gallery');
        this.modalContainer = document.querySelector('#gallery');
        
        if (!this.galleryContainer || !this.modalContainer) {
            console.error('Gallery containers not found');
            return;
        }

        // Clear existing content
        this.galleryContainer.innerHTML = '';
        this.removeExistingModals();

        // Load and display images
        await this.loadImages();
    }

    /**
     * Automatically detect and load images from photos folder
     */
    async loadImages() {
        const imageFiles = await this.getImageFiles();
        
        imageFiles.forEach((filename, index) => {
            this.createGalleryItem(filename, index + 1);
            this.createModal(filename, index + 1);
        });

        console.log(`Loaded ${imageFiles.length} images automatically`);
    }

    /**
     * Get list of image files from photos folder
     * Uses external config file - no CORS issues!
     */
    async getImageFiles() {
        // Check if IMAGE_CONFIG is available (loaded from images-config.js)
        if (typeof IMAGE_CONFIG !== 'undefined' && IMAGE_CONFIG.images) {
            console.log(`Found ${IMAGE_CONFIG.images.length} images from config`);
            return IMAGE_CONFIG.images;
        } else {
            console.error('IMAGE_CONFIG not found. Please include images-config.js');
            return [];
        }
    }

    /**
     * Check if an image file exists (quiet - no console errors)
     */
    async imageExistsQuiet(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
        });
    }

    /**
     * Check if an image file exists
     */
    async imageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
        });
    }

    /**
     * Create a gallery item element
     */
    createGalleryItem(filename, index) {
        const imagePath = `${this.photosFolder}${filename}`;
        const description = this.generateDescriptionFromFilename(filename);
        const modalId = `modal${index}`;

        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-toggle', 'modal');
        galleryItem.setAttribute('data-target', `#${modalId}`);
        
        galleryItem.innerHTML = `
            <img src="${imagePath}" alt="${description}" loading="lazy">
            <div class="gallery-overlay">${description}</div>
        `;

        this.galleryContainer.appendChild(galleryItem);
    }

    /**
     * Create a modal for image viewing
     */
    createModal(filename, index) {
        const imagePath = `${this.photosFolder}${filename}`;
        const description = this.generateDescriptionFromFilename(filename);
        const modalId = `modal${index}`;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', `modalLabel${index}`);
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-body p-0">
                        <img src="${imagePath}" alt="${description}" class="img-fluid">
                    </div>
                    <div class="modal-footer">
                        <p class="mb-0">${description}</p>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.modalContainer.appendChild(modal);
    }

    /**
     * Generate a human-readable description from filename
     * Converts filenames like "sunset-beach.jpg" to "Sunset Beach"
     */
    generateDescriptionFromFilename(filename) {
        // Remove file extension
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        
        // Handle different naming patterns
        let description = nameWithoutExt;
        
        // If it's just "photoX" pattern, keep it simple
        if (/^photo\d+$/i.test(nameWithoutExt)) {
            const number = nameWithoutExt.match(/\d+/)[0];
            return `Photo ${number}`;
        }
        
        // Convert underscores and hyphens to spaces
        description = description.replace(/[-_]/g, ' ');
        
        // Remove "photo" prefix if present
        description = description.replace(/^photo\s*/i, '');
        
        // Capitalize each word
        description = description.replace(/\b\w+/g, word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        
        // If description is empty or just numbers, provide a default
        if (!description.trim() || /^\d+$/.test(description.trim())) {
            return 'Photography';
        }
        
        return description.trim();
    }

    /**
     * Remove existing hardcoded modals
     */
    removeExistingModals() {
        const existingModals = this.modalContainer.querySelectorAll('.modal');
        existingModals.forEach(modal => modal.remove());
    }


    /**
     * Refresh the gallery (useful for adding new images)
     */
    async refresh() {
        await this.init();
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const gallery = new PhotoGallery();
    gallery.init();
    
    // Make gallery instance globally available for manual refresh
    window.photoGallery = gallery;
});

// Optional: Auto-refresh gallery every 30 seconds to catch new images
// Uncomment the following lines if you want automatic detection of new images
/*
setInterval(() => {
    if (window.photoGallery) {
        window.photoGallery.refresh();
    }
}, 30000);
*/
