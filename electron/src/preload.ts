import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("Steamworks", {
   writeTextToFile: (name: string, content: string) => ipcRenderer.invoke("writeTextToFile", name, content),
   readTextFromFile: (name: string) => ipcRenderer.invoke("readTextFromFile", name),
});
