// Client-side IndexedDB vault for in-browser Recording Studio
// Stores recordings locally on the presenter's Mac with zero server/cloud bandwidth.

const DB_NAME = 'upsc_recording_studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';
const MAX_STORED_RECORDINGS = 8;

function openVaultDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRecordingToVault(record) {
  try {
    const db = await openVaultDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        ...record,
        updatedAt: Date.now(),
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });

    // Prune older recordings beyond MAX_STORED_RECORDINGS
    await pruneOldRecordings(db);
    db.close();
    return true;
  } catch (err) {
    console.warn('[RecordingVault] Failed to save recording to IndexedDB:', err);
    return false;
  }
}

async function pruneOldRecordings(db) {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        const items = Array.isArray(getAllReq.result) ? getAllReq.result : [];
        if (items.length > MAX_STORED_RECORDINGS) {
          items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          const toDelete = items.slice(MAX_STORED_RECORDINGS);
          for (const oldItem of toDelete) {
            store.delete(oldItem.id);
          }
        }
        resolve();
      };
      getAllReq.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function listVaultRecordings() {
  try {
    const db = await openVaultDb();
    const items = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch (err) {
    console.warn('[RecordingVault] Failed to list recordings:', err);
    return [];
  }
}

export async function deleteVaultRecording(id) {
  try {
    const db = await openVaultDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return true;
  } catch (err) {
    console.warn('[RecordingVault] Failed to delete recording:', err);
    return false;
  }
}

export async function clearAllVaultRecordings() {
  try {
    const db = await openVaultDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return true;
  } catch (err) {
    console.warn('[RecordingVault] Failed to clear recordings:', err);
    return false;
  }
}

export function formatDurationTimestamp(totalSec) {
  const s = Math.max(0, Math.floor(Number(totalSec) || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function formatYouTubeChapters(chapters = [], lectureTitle = 'UPSC Lecture Session') {
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return `00:00 ${lectureTitle}`;
  }
  const lines = [];
  chapters.forEach((ch, idx) => {
    const ts = idx === 0 ? '00:00' : formatDurationTimestamp(ch.startSec);
    lines.push(`${ts} - ${ch.label}`);
  });
  return lines.join('\n');
}
