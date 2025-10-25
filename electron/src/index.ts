import { init, shutdown, type Client } from "@fishpondstudio/steamworks.js";
import { BrowserWindow, Menu, app, dialog, ipcMain } from "electron";
import crypto from "node:crypto";
import { existsSync, renameSync } from "node:fs";
import path from "node:path";
import originalFs from "original-fs";
import { IPCService } from "./IPCService";

export type SteamClient = Omit<Client, "init" | "runCallbacks">;

app.commandLine.appendSwitch("enable-logging", "file");

const logPath = path.join(getLocalGameSavePath(), "CivIdle.log");
if (existsSync(logPath)) {
   renameSync(logPath, path.join(getLocalGameSavePath(), "CivIdle-prev.log"));
}

app.commandLine.appendSwitch("log-file", logPath);
app.commandLine.appendSwitch("enable-experimental-web-platform-features");

export function getGameSavePath(): string {
   return path.join(app.getPath("appData"), "CivIdleSaves");
}

export function getLocalGameSavePath(): string {
   return path.join(app.getPath("appData"), "CivIdleLocal");
}

export const MIN_WIDTH = 1136;
export const MIN_HEIGHT = 640;

const disableFloatingMode = !app.isPackaged || process.argv.includes("--disable-floating-mode");
// const enableDevTools = process.argv.includes("--enable-dev-tools");

const createWindow = async () => {
   try {
      const steam = init();
      const mainWindow = new BrowserWindow({
         webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            devTools: !app.isPackaged,
            backgroundThrottling: false,
         },
         minHeight: MIN_HEIGHT,
         minWidth: MIN_WIDTH,
         show: false,
         frame: disableFloatingMode,
         roundedCorners: false,
         thickFrame: disableFloatingMode,
         backgroundColor: "#000000",
      });

      try {
         await Promise.all([
            mainWindow.webContents.session.clearCache(),
            mainWindow.webContents.session.clearAuthCache(),
            mainWindow.webContents.session.clearCodeCaches({}),
         ]);
      } catch (error) {
         console.error("Failed to clear cache:", error);
      }

      let checksum = "";

      if (app.isPackaged) {
         const archive = path.join(process.resourcesPath, "app.asar");
         if (originalFs.existsSync(archive)) {
            const content = originalFs.readFileSync(archive);
            checksum = crypto.createHash("sha256").update(content).digest("hex");
         }
         mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
      } else {
         mainWindow.loadURL("http://localhost:3000");
         mainWindow.webContents.openDevTools();
      }

      mainWindow.removeMenu();
      mainWindow.maximize();
      mainWindow.show();

      if (steam.utils.isSteamRunningOnSteamDeck()) {
         mainWindow.setFullScreen(true);
      }

      mainWindow.on("close", (e) => {
         e.preventDefault();
         mainWindow.webContents.send("close");
      });

      const service = new IPCService(steam, mainWindow, checksum);

      ipcMain.handle("__RPCCall", (e, method: keyof IPCService, args) => {
         // @ts-expect-error
         return service[method].apply(service, args);
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
   shutdown();
   app.quit();
}
