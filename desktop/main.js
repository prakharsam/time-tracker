const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { publicIpv4 } = require("public-ip");
const macaddress = require("macaddress");
const screenshot = require("screenshot-desktop");
const FormData = require("form-data");
const axios = require("axios");
const streamifier = require("streamifier");

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

  ipcMain.on("capture-screenshot", async (event, { email, has_permission }) => {
    try {
      const imgBuffer = await screenshot({ format: 'png' });
      const ip_address = await publicIpv4();
      const mac_address = await macaddress.one();
  
      const form = new FormData();
      form.append("employee_id", email);
      form.append("has_permission", has_permission.toString()); // string!
      form.append("ip_address", ip_address);
      form.append("mac_address", mac_address);
      form.append("image", streamifier.createReadStream(imgBuffer), {
        filename: `${Date.now()}.png`,
        contentType: "image/png"
      });
  
      await axios.post("http://localhost:8000/screenshots", form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity
      });
  
      console.log("📸 Screenshot uploaded");
    } catch (err) {
      console.error("❌ Screenshot upload failed:", err.message);
    }
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
