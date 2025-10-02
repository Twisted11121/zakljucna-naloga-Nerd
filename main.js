const { app, BrowserWindow, ipcMain, } = require('electron')

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// sqlite database
const db = new sqlite3.Database(path.join(__dirname, 'app.db'), (err) => {
  if (err) {
    console.error('Error opening database', err)
    return
  }

  const sql = `
    CREATE TABLE IF NOT EXISTS Login (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Username TEXT CHECK(length(Username) <= 16),
      Password TEXT CHECK(length(Password) <= 32)
    );
    CREATE TABLE IF NOT EXISTS Content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator TEXT,
      name TEXT,
      description TEXT,
      file TEXT
    );`

  db.exec(sql, (e) => {
    if (e) console.error('Error creating tables', e)
  })
})



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
  mainWindow.webContents.openDevTools({ mode: 'detach' }); // shows renderer console
  
});

ipcMain.on('login-data', (event, data) => {
  db.get('SELECT Username, Password FROM Login WHERE Username = ?', [data.username], (err, row) => {
    if (err) {
      console.error('DB error', err)
      event.reply('save-complete', { success: false, error: 'Database error' })
      return
    }

    if (!row) {
      // user not found -> insert
      db.run('INSERT INTO Login (Username, Password) VALUES (?, ?)', [data.username, data.password], function(runErr) {
        if (runErr) {
          console.error('Insert error', runErr)
          event.reply('save-complete', { success: false, error: 'Insert failed' })
          return
        }
        loadIndexAndSend(data.username)
      })
    } else {
      // user exists -> check password
      if (row.Password === data.password) {
        loadIndexAndSend(data.username)
      } else {
        event.reply('save-complete', { success: false, error: 'Invalid password' })
      }
    }
  })
});

function loadIndexAndSend(username) {
  mainWindow.loadFile('index.html')
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('save-complete', { success: true, username })
  })
}