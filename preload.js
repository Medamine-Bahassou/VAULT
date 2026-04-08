const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  exportPasswords: (data) => ipcRenderer.invoke('export-passwords', data),
  importPasswords: () => ipcRenderer.invoke('import-passwords'),
});
