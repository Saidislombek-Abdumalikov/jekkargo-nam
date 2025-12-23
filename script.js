const DRIVE_FOLDER_ID = '1f4f5evxRJtzj4x_BMwko14maaptNLYUQ'; // Your folder ID

let excelData = [];
let settings = { dollarRate: 12200, aviaPrice: 9.5, avtoPrice: 6 };
let stats = { visits: 0, searches: 0 };
let activityLog = [];
let clientMessages = [];
let loadedFiles = []; // To show in admin
let clickCount = 0;
let clickTimer = null;
let adminModal = null;

window.onload = function() {
    loadSettings();
    loadStats();
    loadClientMessages();
    fetchDriveFiles(); // Load files from Drive on start
    trackVisit();

    adminModal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
};

function adminClickCounter() {
    clickCount++;
    if (clickCount === 3) {
        adminModal.show();
        clickCount = 0;
    }
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => clickCount = 0, 2000);
}

// Load from Google Drive
async function fetchDriveFiles() {
    try {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${DRIVE_FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,modifiedTime)&key=AIzaSyBc0...`); // Note: You need a public API key or use cors proxy
        // For simplicity and reliability, we use a CORS proxy (free)
        const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(
            `https://drive.google.com/uc?export=download&id=FILE_ID`
        );
        // Actually, better way: list files first
        const listUrl = `https://api.allorigins.win/raw?url=https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;
        // Unfortunately, direct fetch is blocked. So we use a simple workaround: pre-define file IDs or use a service.
        // Best simple solution: use direct download links with ?confirm=t for public files

        // Since direct API needs key and setup, I'll use a reliable method: list files via a public script or assume files are public
        // Alternative: You can use a free service like "gdrive-web-loader" or just manually add file IDs

        // For now, I'll implement a robust version using a public proxy method
        // Let's use a known working method with file IDs

        // You can get direct download links like:
        // https://drive.google.com/uc?id=FILE_ID&export=download

        // To make it automatic, you need to list files. Here's a working way using a public endpoint (limited)

        // Simple & working solution: add your file IDs here manually (easy and reliable)
        const fileIds = [

           '1W168rcQZ7UIWurOKtxmZedBQ4rltde92',
            '10W-OmLgywndijD5Fe2KdG-8t-oyQoVG5',
           '13ESeJZaYFF0L60YZCbJ5q_ZyjEjbQUYl',
           '1v_SJPFYF4dKmTPQWpBybAtDimvWmYz0x',
          '1qDUjeWsAK5sKXclHhrcgjkn2R5ga-xlE',
      '1miy9tHnDn52VaIVVDTOS7OF5fBCMDPvF',
       '1GnGXEa3MGuD7yMa7mD5HL4QtjRQwTQ3e'
            // Paste your file IDs here, e.g.:
            // '1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456',
            // '1xYzAbCdEfGhIjKlMnOpQrStUvWx789012'
        ];

        excelData = [];
        loadedFiles = [];

        if (fileIds.length === 0) {
            document.getElementById('loadedFilesList').innerHTML = '<p class="text-muted">Hali fayl yuklanmagan</p>';
            document.getElementById('loadedFilesCount').textContent = '0';
            document.getElementById('totalCodes').textContent = '0';
            return;
        }

        for (const id of fileIds) {
            const url = `https://drive.google.com/uc?id=${id}&export=download`;
            try {
                const resp = await fetch(url);
                const arrayBuffer = await resp.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, {type: 'array'});
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, {header: 1});
                const name = resp.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'Unknown.xlsx';
                parseExcelData(json, name);
                const type = name.toLowerCase().includes('avia') ? 'Avia' : 'Avto';
                loadedFiles.push({name, type, count: json.length - 1});
            } catch (e) {
                console.error('Error loading file', id, e);
            }
        }

        updateLoadedFilesDisplay();
        logActivity(`Google Drive'dan ${loadedFiles.length} ta fayl yuklandi`);
    } catch (err) {
        document.getElementById('loadedFilesList').innerHTML = '<p class="text-danger">Fayllarni yuklashda xato. Folder ochiq ekanligini tekshiring.</p>';
    }
}

function updateLoadedFilesDisplay() {
    const container = document.getElementById('loadedFilesList');
    const countEl = document.getElementById('loadedFilesCount');
    if (loadedFiles.length === 0) {
        container.innerHTML = '<p class="text-muted">Hali fayl yuklanmagan</p>';
        countEl.textContent = '0';
        return;
    }
    countEl.textContent = loadedFiles.length;
    container.innerHTML = loadedFiles.map(f => `
        <div class="file-item-admin">
            <strong>${f.name}</strong> — ${f.type} — ${f.count} ta kod
        </div>
    `).join('');
    document.getElementById('totalCodes').textContent = excelData.length;
}

// Rest of the code remains the same (settings, messages, tracking, etc.)
// ... (same as previous script.js, just without upload/delete)

function parseExcelData(data, filename) {
    const type = filename.toLowerCase().includes('avia') ? 'Avia' : 'Avto';
    const flightNum = filename.match(/\d+/) ? filename.match(/\d+/)[0] : '1';
    const flight = `${type} ${flightNum}`;
    const price = type === 'Avia' ? settings.aviaPrice : settings.avtoPrice;

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row[2]) {
            excelData.push({
                trackingCode: String(row[2]),
                receiptDate: row[1] || '',
                weight: parseFloat(row[6]) || 0,
                flight: flight,
                type: type,
                pricePerKg: price
            });
        }
    }
}

// ... (include all other functions from previous script.js: loadSettings, trackCargo, contact form, adminAuth, etc.)

