const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveUser: (user) => ipcRenderer.send("save-user", user),
  getUser: () => ipcRenderer.invoke("get-user")
});
