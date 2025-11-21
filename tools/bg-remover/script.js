import { removeBackground } from "https://esm.sh/@imgly/background-removal@1.4.5";

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const resultArea = document.getElementById('resultArea');
    const originalImg = document.getElementById('originalImg');
    const processedImg = document.getElementById('processedImg');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (!dropZone || !fileInput) return;

    // Click to upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // File Input Change
    fileInput.addEventListener('change', (e) => {
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

        if (e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        resultArea.style.display = 'none';
        dropZone.style.display = 'block'; // Restore block display
        dropZone.style.opacity = '1';
        dropZone.style.pointerEvents = 'auto';
        fileInput.value = '';
        originalImg.src = '';
        processedImg.src = '';
        // Hide images again to prevent broken icon
        originalImg.style.display = 'none';
        processedImg.style.display = 'none';
    });

    async function processFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        // Transition UI
        dropZone.style.opacity = '0';
        dropZone.style.pointerEvents = 'none';

        setTimeout(() => {
            dropZone.style.display = 'none';
            resultArea.style.display = 'block';
            // Fade in result area
            resultArea.style.opacity = '0';
            requestAnimationFrame(() => {
                resultArea.style.opacity = '1';
            });
        }, 300);

        loadingSpinner.style.display = 'block';

        // Show Original
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImg.src = e.target.result;
            originalImg.style.display = 'block'; // Show only when loaded
        };
        reader.readAsDataURL(file);

        try {
            const config = {
                progress: (key, current, total) => {
                    // Optional: Update a progress bar if we had one
                }
            };

            const blob = await removeBackground(file, config);
            const url = URL.createObjectURL(blob);

            processedImg.src = url;
            processedImg.onload = () => {
                processedImg.style.display = 'block'; // Show only when loaded
                loadingSpinner.style.display = 'none';
            };

            downloadBtn.href = url;
            downloadBtn.download = `removed-${file.name.split('.')[0]}.png`;

        } catch (error) {
            console.error(error);
            alert('Failed to process image.');
            loadingSpinner.style.display = 'none';
            // Revert UI on error
            resetBtn.click();
        }
    }
});
