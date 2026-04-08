const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ── IPC Handlers ──────────────────────────────────────────────────────────────

ipcMain.handle('minimize-window', () => mainWindow.minimize());
ipcMain.handle('maximize-window', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.handle('close-window', () => mainWindow.close());

ipcMain.handle('export-passwords', async (event, encryptedData) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Encrypted Vault',
    defaultPath: `vault-export-${Date.now()}.txt`,
    filters: [{ name: 'Encrypted Vault', extensions: ['txt'] }]
  });
  if (filePath) {
    fs.writeFileSync(filePath, encryptedData, 'utf8');
    return { success: true, path: filePath };
  }
  return { success: false };
});

ipcMain.handle('import-passwords', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Encrypted Vault',
    filters: [{ name: 'Encrypted Vault', extensions: ['txt'] }],
    properties: ['openFile']
  });
  if (filePaths && filePaths[0]) {
    const data = fs.readFileSync(filePaths[0], 'utf8');
    return { success: true, data };
  }
  return { success: false };
});
