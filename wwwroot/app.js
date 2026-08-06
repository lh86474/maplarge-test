/*
 * Function that loads a folder and displays its contents
 * uses JS fetch API
 * @param {string} path - the path to the folder to load
 */
async function loadFolder(path = '') {
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
    const tableBody = document.getElementById('fileTableBody');

    // handle empty folders
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No files found</td></tr>';
        return;
    }

    const rows = data.map(item => {
        const typeLabel = item.isDirectory ? 'Folder' : 'File';

        // if folder, create link calling loadFolder, else file, use plain text
        const nameHtml = item.isDirectory
            ? `<a href="#" onclick="loadFolder('${item.relativePath.replace(/'/g, "\\'")}')">${item.name}</a>`
            : item.name;

        const sizeLabel = item.isDirectory ? '-' : `${(item.size / 1024).toFixed(1)} KB`;
        const dateLabel = new Date(item.lastModified).toLocaleString();

        return `
            <tr>
                <td>${typeLabel}</td>
                <td>${nameHtml}</td>
                <td>${sizeLabel}</td>
                <td>${dateLabel}</td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows;
}

// Initial load on page startup
loadFolder('');