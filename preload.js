const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  selectBackupFolder: () => ipcRenderer.invoke('select-backup-folder'),
  saveBackupFile: (data, filename) => ipcRenderer.invoke('save-backup-file', data, filename),
  getBackupDirectory: () => ipcRenderer.invoke('get-backup-directory'),
  setBackupDirectory: (dir) => ipcRenderer.invoke('set-backup-directory', dir),
  // Data file operations for saving to app folder
  readDataFile: (filename) => ipcRenderer.invoke('read-data-file', filename),
  writeDataFile: (filename, data) => ipcRenderer.invoke('write-data-file', filename, data)
});

