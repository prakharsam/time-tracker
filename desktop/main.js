const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.webContents.openDevTools();

  const userPath = path.join(__dirname, 'user.json');
  if (fs.existsSync(userPath)) {
    win.loadFile('dashboard.html');
  } else {
    win.loadFile('login.html');
  }

  ipcMain.on('save-user', (event, employee) => {
    const userPath = path.join(__dirname, 'user.json');
    fs.writeFileSync(userPath, JSON.stringify(employee, null, 2));
  });  
}
console.log("🔍 Preload path:", path.join(__dirname, 'preload.js'));

ipcMain.handle("get-user", () => {
  const userPath = path.join(__dirname, "user.json");
  try {
    const raw = fs.readFileSync(userPath);
    return JSON.parse(raw);
  } catch (e) {
    console.error("❌ Failed to read user.json:", e);
    return null;
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
