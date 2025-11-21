import { removeBackground } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.0.5/dist/browser/index.min.js";

document.addEventListener('DOMContentLoaded', () => {
    console.log('BG Remover App v1.2 Loaded');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const resultSection = document.getElementById('resultSection');
    const originalImg = document.getElementById('originalImg');
    const processedImg = document.getElementById('processedImg');
    const loadingState = document.getElementById('loadingState');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Drag & Drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.querySelector('.upload-card').classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.querySelector('.upload-card').classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.querySelector('.upload-card').classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    resetBtn.addEventListener('click', () => {
        resultSection.style.display = 'none';
        dropZone.style.display = 'block';
        fileInput.value = '';
        originalImg.src = '';
        processedImg.src = '';
    });

    async function handleFile(file) {
        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a PNG, JPG, or WEBP image.');
            return;
        }

        // Show UI state
        dropZone.style.display = 'none';
        resultSection.style.display = 'block';
        loadingState.style.display = 'flex'; // Show loading

        // Display original image
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImg.src = e.target.result;
        };
        reader.readAsDataURL(file);

        try {
            console.log('Starting background removal for:', file.name);

            // Process image
            const config = {
                publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.0.5/dist/"
            };
            const blob = await removeBackground(file, config);

            // Create URL for result
            const url = URL.createObjectURL(blob);
            processedImg.src = url;

            // Setup download
            downloadBtn.href = url;
            downloadBtn.download = `removed-bg-${file.name.split('.')[0]}.png`;

            // Hide loading
            loadingState.style.display = 'none';

        } catch (error) {
            console.error('Error removing background:', error);
            alert(`Failed to remove background: ${error.message}`);
            // Reset UI on error
            resultSection.style.display = 'none';
            dropZone.style.display = 'block';
        }
    }
});
