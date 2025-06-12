const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveUser: (user) => ipcRenderer.send("save-user", user),
  getUser: () => ipcRenderer.invoke("get-user"),
  sendScreenshot: (payload) => ipcRenderer.send("capture-screenshot", payload),
  deleteUser: () => ipcRenderer.send("delete-user")
});
