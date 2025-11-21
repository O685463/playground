const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const originalImage = document.getElementById('originalImage');
const processedImage = document.getElementById('processedImage');
const loadingOverlay = document.getElementById('loadingOverlay');
const downloadBtn = document.getElementById('downloadBtn');

// Drag & Drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    uploadArea.classList.add('dragover');
}

function unhighlight(e) {
    uploadArea.classList.remove('dragover');
}

uploadArea.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFiles, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files: files } });
}

function handleFiles(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    } else {
        alert('Please upload a valid image file.');
    }
}

async function processFile(file) {
    // Show preview UI
    previewContainer.style.display = 'grid';
    downloadBtn.style.display = 'none';
    loadingOverlay.style.display = 'flex';
    
    // Display original image
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function() {
        originalImage.src = reader.result;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/remove-bg', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            processedImage.src = url;
            downloadBtn.href = url;
            downloadBtn.style.display = 'inline-block';
        } else {
            alert('Error processing image.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}
