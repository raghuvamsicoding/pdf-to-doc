const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const convertBtn = document.getElementById('convert-btn');
const downloadLink = document.getElementById('download-link');
let selectedFile = null;

// Drag-and-drop handlers
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => e.preventDefault());
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    selectedFile = e.dataTransfer.files[0];
    handleFileSelect();
});

// File input handler
fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    handleFileSelect();
});

function handleFileSelect() {
    convertBtn.disabled = false;
    dropZone.textContent = `Selected: ${selectedFile.name}`;
}

// Convert button click
convertBtn.addEventListener('click', async () => {
    convertBtn.disabled = true;
    convertBtn.textContent = 'Converting...';

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
        const response = await fetch('http://localhost:5000/convert', {
            method: 'POST',
            body: formData
        });

        // Check if the response is OK
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Conversion failed');
        }

        // Get the blob and create a download link
        const blob = await response.blob();
        if (blob.size === 0) {
            throw new Error('Empty DOCX file generated');
        }

        const url = window.URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'converted.docx';
        downloadLink.hidden = false;

        // Auto-click the download link (optional)
        downloadLink.click();

    } catch (error) {
        alert(error.message);
    } finally {
        convertBtn.textContent = 'Convert';
        convertBtn.disabled = false;
    }
});