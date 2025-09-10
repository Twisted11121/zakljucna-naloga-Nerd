const { app, BrowserWindow } = require('electron')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mydb.db');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})
