// Use global logger
const log = window.log || console.log;

log('Module script started. Attempting to import library...');

import { removeBackground } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.0.5/dist/browser/index.min.js";

log('Library imported successfully.');

document.addEventListener('DOMContentLoaded', () => {
    log('DOM Content Loaded (Module).');

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const resultArea = document.getElementById('resultArea');
    const originalImg = document.getElementById('originalImg');
    const processedImg = document.getElementById('processedImg');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (!dropZone || !fileInput) {
        log('CRITICAL: Required elements not found!', 'error');
        return;
    }

    // Click to upload
    dropZone.addEventListener('click', () => {
        log('DropZone clicked. Opening file dialog...');
        fileInput.click();
    });

    // File Input Change
    fileInput.addEventListener('change', (e) => {
        log(`File input changed. Files: ${e.target.files.length}`);
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    });

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        log('File dropped.');

        if (e.dataTransfer.files.length > 0) {
            log(`Processing dropped file: ${e.dataTransfer.files[0].name}`);
            processFile(e.dataTransfer.files[0]);
        } else {
            log('No files found in drop event.', 'error');
        }
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        log('Resetting UI.');
        resultArea.style.display = 'none';
        dropZone.style.display = 'block';
        fileInput.value = '';
    });

    async function processFile(file) {
        log(`Starting process for: ${file.name} (${file.type})`);

        if (!file.type.startsWith('image/')) {
            log('Invalid file type. Must be an image.', 'error');
            alert('Please upload an image file.');
            return;
        }

        // Show UI
        dropZone.style.display = 'none';
        resultArea.style.display = 'block';
        loadingSpinner.style.display = 'block';

        // Show Original
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImg.src = e.target.result;
            log('Original image loaded into view.');
        };
        reader.readAsDataURL(file);

        try {
            log('Calling removeBackground...');
            const config = {
                publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.0.5/dist/",
                progress: (key, current, total) => {
                    log(`Progress: ${key} ${Math.round(current / total * 100)}%`);
                }
            };

            const blob = await removeBackground(file, config);
            log('Background removed successfully.');

            const url = URL.createObjectURL(blob);
            processedImg.src = url;
            downloadBtn.href = url;
            downloadBtn.download = `removed-${file.name.split('.')[0]}.png`;

            loadingSpinner.style.display = 'none';
            log('Process complete. Result displayed.');

        } catch (error) {
            log(`Error: ${error.message}`, 'error');
            console.error(error);
            alert('Failed to process image. Check debug log.');
            loadingSpinner.style.display = 'none';
        }
    }
});
