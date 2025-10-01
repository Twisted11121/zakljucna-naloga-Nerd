const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendData: (data) => ipcRenderer.send('login-data', data),
  onSaveComplete: (callback) => ipcRenderer.on('save-complete', (event, result) => callback(result))
});