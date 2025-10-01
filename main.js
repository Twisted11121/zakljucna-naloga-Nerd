const { app, BrowserWindow, ipcMain } = require('electron')

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.js'
    }
  });
  mainWindow.loadFile('login.html');
});

ipcMain.on('login-data', (event, data) => {

  // load the new page
  mainWindow.loadFile('index.html');

  // wait until new page is ready, then send username
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('save-complete', {
      success: true,
      username: data.username
    });
  });
});