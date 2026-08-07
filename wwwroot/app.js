/*
 * Function that loads a folder and displays its contents
 * uses JS fetch API
 * @param {string} path - the path to the folder to load
 */
async function loadFolder(path = '') {
    window.location.hash = `#path=${encodeURIComponent(path)}`;

    const url = '/Test/browse?path=' + encodeURIComponent(path);

    // Use fetch 
    const response = await fetch(url);

    // parse the json body
    const data = await response.json();

    // update the header
    document.getElementById('pathHeader').innerText = `Folder: /${path}`;

    // render data

    renderTable(data);
}

/*
 * Function that performs a search based on the query
 */
async function performSearch() {
    const query = document.getElementById('searchInput').value;
    // return if empty query
    if (!query) {
        return;
    }

    window.location.hash = `#search=${encodeURIComponent(query)}`;

    const url = '/Test/search?query=' + encodeURIComponent(query);

    const response = await fetch(url);

    const data = await response.json();

    document.getElementById('pathHeader').innerText = `Search results for: "${query}"`;

    renderTable(data);
}

/*
 * Function that renders the table
 * @param {object[]} data: array of files
 */

function renderTable(data) {

    // call updateSummaryStates
    updateSummaryStates(data);

    const tableBody = document.getElementById('fileTableBody');

    // handle empty folders
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No files found</td></tr>';
        return;
    }

    // Use filter

    const rows = data.map(item => {
        const typeLabel = item.isDirectory ? 'Folder' : 'File';

        // if folder, create link calling loadFolder, else file, use plain text
        const nameHtml = item.isDirectory
            ? `<a href="#" onclick="loadFolder('${item.relativePath.replace(/'/g, "\\'")}')">${item.name}</a>`
            : item.name;

        const sizeLabel = item.isDirectory ? '-' : `${(item.size / 1024).toFixed(1)} KB`;
        const dateLabel = new Date(item.lastModified).toLocaleString();

        const downloadHtml = item.isDirectory
            ? '-'
            : `<a href="/Test/download?
            path=${encodeURIComponent(item.relativePath)}">Download </a>`;

        return `
            <tr>
                <td>${typeLabel}</td>
                <td>${nameHtml}</td>
                <td>${sizeLabel}</td>
                <td>${dateLabel}</td>
                <td>${downloadHtml}</td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}

/*
 * Calculates folder counts, file counts, and total file size
 * @param {object[]} data - array of file/folder objects
 */
function updateSummaryStates(data) {
    const summaryElement = document.getElementById('summaryStats');

    // calculate folder count
    const folderCount = data.filter(item => item.isDirectory).length;

    // file count
    const fileCount = data.filter(item => !item.isDirectory).length;

    // calculate total bytes
    const totalBytes = data
        .filter(item => !item.isDirectory)
        .reduce((sum, item) => sum + item.size, 0);

    // format total bytes into kb or mb

    const formattedSize = totalBytes > 1024 * 1024
        ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(totalBytes / 1024).toFixed(1)} KB`;

    // update text
    summaryElement.innerText = `${folderCount} Folders, ${fileCount} Files | 
    Total Size: ${formattedSize}`;
}

/*
 * Reads the URL hash on page load, refresh, and back/forward navigation
 */
async function handleHash() {
    const rawHash = window.location.hash.substring(1);
    const params = new URLSearchParams(rawHash);

    if (params.has('search')) {
        const query = params.get('search');
        document.getElementById('searchInput').value = query;
        const response = await fetch('/Test/search?query=' + encodeURIComponent(query));
        const data = await response.json();
        document.getElementById('pathHeader').innerText = `Search results for: "${query}"`;
        renderTable(data);
    } else if (params.has('path')) {
        const path = params.get('path');
        const response = await fetch('/Test/browse?path=' + encodeURIComponent(path));
        const data = await response.json();
        document.getElementById('pathHeader').innerText = `Folder: /${path}`;
        renderTable(data);
    } else {
        const response = await fetch('/Test/browse?path=');
        const data = await response.json();
        document.getElementById('pathHeader').innerText = 'Folder: /';
        renderTable(data);
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

    // get the directory path from the current URL
    const rawHash = window.location.hash.substring(1);
    const params = new URLSearchParams(rawHash);
    const currentPath = params.get('path') || '';

    // use fetch
    const response = await fetch('/Test/upload?path=' +
        encodeURIComponent(currentPath), {
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

// Listen for browser Back/Forward button clicks
window.addEventListener('hashchange', handleHash);

// Trigger initial load on page startup based on current URL hash
handleHash();