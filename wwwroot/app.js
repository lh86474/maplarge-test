/*
 * Calculates folder counts, file counts, and total file size
 * @param {object[]} data - array of file/folder objects
 */
function updateSummaryStates(data) {
    const summaryElement = document.getElementById('summaryStats');
    if (!data) return;

    // Calculate folder count
    const folderCount = data.filter(item => item.isDirectory).length;

    // File count
    const fileCount = data.filter(item => !item.isDirectory).length;

    // Calculate total bytes
    const totalBytes = data
        .filter(item => !item.isDirectory)
        .reduce((sum, item) => sum + item.size, 0);

    // Format total bytes into KB or MB
    const formattedSize = totalBytes > 1024 * 1024
        ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(totalBytes / 1024).toFixed(1)} KB`;

    // Update text
    summaryElement.innerText = `${folderCount} Folders, ${fileCount} Files | Total Size: ${formattedSize}`;
}

/*
 * Function that renders the table
 * @param {object[]} data: array of file/folder items
 */
function renderTable(data) {
    // Update summary statistics
    updateSummaryStates(data);

    const tableBody = document.getElementById('fileTableBody');

    // Handle empty folders
    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No files found</td></tr>';
        return;
    }

    const rows = data.map(item => {
        const typeLabel = item.isDirectory ? 'Folder' : 'File';
        const cleanPath = (item.relativePath || item.name || '').replace(/\\/g, '/');

        // Extract folder path
        let folderDir = '';
        if (item.isDirectory) {
            folderDir = cleanPath;
        } else {
            const lastSlash = cleanPath.lastIndexOf('/');
            folderDir = lastSlash !== -1 ? cleanPath.substring(0, lastSlash) : '';
        }

        const folderHtml = folderDir
            ? `<a href="#path=${encodeURIComponent(folderDir)}">/${folderDir}</a>`
            : '/';

        // If folder, link to URL hash; if file, plain text
        const nameHtml = item.isDirectory
            ? `<a href="#path=${encodeURIComponent(cleanPath)}">${item.name}</a>`
            : item.name;

        const sizeLabel = item.isDirectory ? '-' : `${(item.size / 1024).toFixed(1)} KB`;
        const dateLabel = item.lastModified ? new Date(item.lastModified).toLocaleString() : '-';

        const downloadHtml = item.isDirectory
            ? '-'
            : `<a href="/Test/download?path=${encodeURIComponent(cleanPath)}">Download</a>`;

        return `
            <tr>
                <td>${typeLabel}</td>
                <td>${nameHtml}</td>
                <td>${folderHtml}</td>
                <td>${sizeLabel}</td>
                <td>${dateLabel}</td>
                <td>${downloadHtml}</td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}

/*
 * Reads the URL hash on page load, refresh, and back/forward navigation
 */
async function handleHash() {
    const rawHash = window.location.hash.substring(1);
    const params = new URLSearchParams(rawHash);

    if (params.has('search')) {
        const query = params.get('search');
        const url = '/Test/search?query=' + encodeURIComponent(query);
        const response = await fetch(url);
        const data = await response.json();
        document.getElementById('pathHeader').innerText = `Search Results for: "${query}"`;
        renderTable(data);
        // navigate to folder
    } else if (params.has('path')) {
        const path = params.get('path');
        const url = '/Test/browse?path=' + encodeURIComponent(path);
        const response = await fetch(url);
        const data = await response.json();
        const displayPath = path ? `/${path.replace(/^\/+/, '')}` : 'Root (/)';
        document.getElementById('pathHeader').innerText = `Current Folder: ${displayPath}`;
        renderTable(data);
        // default root folder
    } else {
        const response = await fetch('/Test/browse?path=');
        const data = await response.json();
        document.getElementById('pathHeader').innerText = 'Current Folder: Root (/)';
        renderTable(data);
    }
}

/*
 * Function that loads a folder by updating the URL hash
 * @param {string} path - the path to the folder to load
 */
async function loadFolder(path = '') {
    const targetHash = `#path=${encodeURIComponent(path)}`;
    if (window.location.hash === targetHash) {
        handleHash();
    } else {
        window.location.hash = targetHash;
    }
}

/*
 * Function that performs a search based on the query
 */
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        return;
    }

    const targetHash = `#search=${encodeURIComponent(query)}`;
    if (window.location.hash === targetHash) {
        handleHash();
    } else {
        window.location.hash = targetHash;
    }
}

/*
 * Uploads a file to the current folder view
 */
async function uploadFile() {
    const fileInput = document.getElementById('fileUploadInput');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a file to upload');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    // Get the directory path from the current URL hash
    const rawHash = window.location.hash.substring(1);
    const params = new URLSearchParams(rawHash);
    const currentPath = params.get('path') || '';

    const response = await fetch('/Test/upload?path=' + encodeURIComponent(currentPath), {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        fileInput.value = '';
        handleHash();
    } else {
        alert('Upload failed');
    }
}

// Listen for browser Back/Forward button clicks and URL hash changes
window.addEventListener('hashchange', handleHash);

// Trigger initial load on page startup based on current URL hash
handleHash();