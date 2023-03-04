import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import path from "path";
import { IPCService } from "./IPCService";
import { SteamAPI } from "./SteamAPI";
// import { SteamAPI } from "./steam";

const createWindow = () => {
   try {
      const api = new SteamAPI();
      const mainWindow = new BrowserWindow({
         webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            devTools: !app.isPackaged,
            backgroundThrottling: false,
         },
         minHeight: 640,
         minWidth: 1136,
         show: false,
      });
      // and load the index.html of the app.
      app.isPackaged
         ? mainWindow.loadFile(path.join(__dirname, "../dist/index.html"))
         : mainWindow.loadURL("http://localhost:3000");

      if (!app.isPackaged) {
         mainWindow.webContents.openDevTools();
      }

      mainWindow.removeMenu();
      mainWindow.maximize();
      mainWindow.show();

      const service = new IPCService(app, api);

      ipcMain.handle("__RPCCall", (e, method, args) => {
         // eslint-disable-next-line prefer-spread
         return service[method as keyof IPCService].apply(service, args);
      });
   } catch (error) {
      dialog.showErrorBox("Failed to Start Game", String(error));
      quit();
   }
};

Menu.setApplicationMenu(null);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
   quit();
});

function quit() {
   SteamAPI.shutdown();
   app.quit();
}
