import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileListContainer = document.getElementById('fileListContainer');
    const fileList = document.getElementById('fileList');
    const fileCount = document.getElementById('fileCount');
    const mergeBtn = document.getElementById('mergeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const btnText = mergeBtn.querySelector('.btn-text');

    let files = [];

    // Drag & Drop Events
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
        handleFiles(e.dataTransfer.files);
    });

    // Click to Upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; // Reset input
    });

    // Clear All
    clearBtn.addEventListener('click', () => {
        files = [];
        renderFileList();
    });

    // Merge
    mergeBtn.addEventListener('click', async () => {
        if (files.length === 0) return;

        setLoading(true);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();

                if (file.type === 'application/pdf') {
                    const pdf = await PDFDocument.load(arrayBuffer);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                } else if (file.type.startsWith('image/')) {
                    let image;
                    if (file.type === 'image/png') {
                        image = await mergedPdf.embedPng(arrayBuffer);
                    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                        image = await mergedPdf.embedJpg(arrayBuffer);
                    }

                    if (image) {
                        const page = mergedPdf.addPage([image.width, image.height]);
                        page.drawImage(image, {
                            x: 0,
                            y: 0,
                            width: image.width,
                            height: image.height,
                        });
                    }
                }
            }

            const pdfBytes = await mergedPdf.save();
            downloadPdf(pdfBytes, 'merged-document.pdf');

        } catch (error) {
            console.error('Merge failed:', error);
            alert('Failed to merge files. Please ensure all files are valid.');
        } finally {
            setLoading(false);
        }
    });

    function handleFiles(newFiles) {
        const validFiles = Array.from(newFiles).filter(file =>
            file.type === 'application/pdf' ||
            file.type === 'image/png' ||
            file.type === 'image/jpeg' ||
            file.type === 'image/jpg'
        );

        if (validFiles.length === 0) {
            alert('Please upload PDF or Image files (PNG/JPG).');
            return;
        }

        files = [...files, ...validFiles];

        // Auto-sort by name to handle sequential images
        files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        renderFileList();
    }

    function renderFileList() {
        fileList.innerHTML = '';
        fileCount.textContent = `${files.length} files`;

        if (files.length > 0) {
            fileListContainer.style.display = 'block';
            clearBtn.style.display = 'inline-flex';
            mergeBtn.disabled = false;
        } else {
            fileListContainer.style.display = 'none';
            clearBtn.style.display = 'none';
            mergeBtn.disabled = true;
        }

        files.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';

            const icon = file.type === 'application/pdf' ? '📄' : '🖼️';
            const size = (file.size / 1024).toFixed(1) + ' KB';

            li.innerHTML = `
                <span class="file-icon">${icon}</span>
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${size}</span>
                </div>
                <button class="remove-btn" title="Remove">×</button>
            `;

            li.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFile(index);
            });

            fileList.appendChild(li);
        });
    }

    function removeFile(index) {
        files.splice(index, 1);
        renderFileList();
    }

    function setLoading(isLoading) {
        if (isLoading) {
            mergeBtn.disabled = true;
            loadingSpinner.style.display = 'block';
            btnText.style.display = 'none';
        } else {
            mergeBtn.disabled = false;
            loadingSpinner.style.display = 'none';
            btnText.style.display = 'block';
        }
    }

    function downloadPdf(bytes, filename) {
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
