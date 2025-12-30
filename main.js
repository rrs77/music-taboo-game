const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Set up persistent storage location for the app
// This ensures data is saved in a writable location
if (!app.isPackaged) {
  // Development mode - use a custom path
  app.setPath('userData', path.join(app.getPath('documents'), 'MusicTaboo'));
} else {
  // Production mode - use app's userData directory (writable)
  const userDataPath = app.getPath('userData');
  console.log('User data path:', userDataPath);
}

let mainWindow;
let backupDirectory = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      // Enable localStorage and sessionStorage
      partition: 'persist:musictaboo'
    },
    icon: path.join(__dirname, 'icon.png'), // Optional: add an icon
    titleBarStyle: 'default',
    backgroundColor: '#4f46e5'
  });

  // Load the HTML file
  const htmlPath = path.join(__dirname, 'Taboo.html');
  mainWindow.loadFile(htmlPath);

  // Open DevTools in development (comment out for production)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Ensure data is saved before window closes
  mainWindow.on('close', (event) => {
    // Force save all data before closing
    mainWindow.webContents.executeJavaScript(`
      try {
        if (typeof saveCurrentGame === 'function') {
          saveCurrentGame();
        }
        if (typeof getAllData === 'function') {
          const allData = getAllData();
          localStorage.setItem('tabooAllData', JSON.stringify(allData));
          // Force sync
          localStorage.setItem('tabooAllData', localStorage.getItem('tabooAllData'));
        }
      } catch(e) {
        console.error('Error saving on close:', e);
      }
    `);
    // Give it a moment to save
    setTimeout(() => {}, 100);
  });
}

app.whenReady().then(() => {
  // Configure session for persistent storage
  const ses = session.fromPartition('persist:musictaboo');
  ses.clearStorageData({
    storages: ['cookies', 'filesystem']
  }).then(() => {
    console.log('Session storage cleared and ready');
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle backup folder selection
ipcMain.handle('select-backup-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Backup Folder'
  });

  if (!result.canceled && result.filePaths.length > 0) {
    backupDirectory = result.filePaths[0];
    return backupDirectory;
  }
  return null;
});

// Handle saving backup file
ipcMain.handle('save-backup-file', async (event, data, filename) => {
  if (!backupDirectory) {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Backup Folder'
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'No folder selected' };
    }
    backupDirectory = result.filePaths[0];
  }

  try {
    const filePath = path.join(backupDirectory, filename);
    fs.writeFileSync(filePath, data, 'utf8');
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle getting backup directory
ipcMain.handle('get-backup-directory', () => {
  return backupDirectory;
});

// Handle setting backup directory
ipcMain.handle('set-backup-directory', (event, dir) => {
  backupDirectory = dir;
  return true;
});

// Handle reading data file from app folder
ipcMain.handle('read-data-file', async (event, filename) => {
  try {
    const appPath = app.isPackaged ? path.dirname(process.execPath) : __dirname;
    const filePath = path.join(appPath, filename);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error reading data file:', error);
    return null;
  }
});

// Handle writing data file to app folder
ipcMain.handle('write-data-file', async (event, filename, data) => {
  try {
    const appPath = app.isPackaged ? path.dirname(process.execPath) : __dirname;
    const filePath = path.join(appPath, filename);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, data, 'utf8');
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error writing data file:', error);
    return { success: false, error: error.message };
  }
});

