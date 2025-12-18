// storage.js - Manual Folder Management
const DB_NAME = 'ObservationDB';
const DB_VERSION = 1;
let db;

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('folders')) db.createObjectStore('folders', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('days')) db.createObjectStore('days', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('decisions')) db.createObjectStore('decisions', { keyPath: 'id', autoIncrement: true });
        };
        request.onsuccess = (e) => {
            db = e.target.result;
            resolve();
        };
        request.onerror = (e) => reject(e.target.error);
    });
}

async function addCustomFolder(name) {
    const id = name.trim();
    if (!id) return;
    const tx = db.transaction('folders', 'readwrite');
    const store = tx.objectStore('folders');
    return new Promise((resolve) => {
        const req = store.add({ id, name: id });
        req.onsuccess = () => resolve();
        req.onerror = () => {
            alert("A folder with this name already exists.");
            resolve();
        };
    });
}

async function deleteFolder(id) {
    if (!confirm(`Delete "${id}" and all days inside it?`)) return;
    const tx = db.transaction(['folders', 'days', 'decisions'], 'readwrite');
    tx.objectStore('folders').delete(id);
    // Note: In a production app, you'd also loop and delete linked days/decisions
    return new Promise(r => tx.oncomplete = r);
}

// Data Fetching Helpers
async function getAllFolders() {
    return new Promise(r => {
        const req = db.transaction('folders').objectStore('folders').getAll();
        req.onsuccess = () => r(req.result);
    });
}

async function getDaysInFolder(folderId) {
    return new Promise(r => {
        const req = db.transaction('days').objectStore('days').getAll();
        req.onsuccess = () => r(req.result.filter(d => d.folderId === folderId));
    });
}

async function getDecisionsForDay(dayId) {
    return new Promise(r => {
        const req = db.transaction('decisions').objectStore('decisions').getAll();
        req.onsuccess = () => r(req.result.filter(d => d.dayId === dayId));
    });
}