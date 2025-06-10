const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load local HTML file (your desktop UI)
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);