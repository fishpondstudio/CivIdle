import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("IPCBridge", {
   rpcCall: (method: string, ...args: any[]) => ipcRenderer.invoke("__RPCCall", method, ...args),
});
