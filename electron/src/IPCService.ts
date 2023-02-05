// ipcMain.handle("writeTextToFile", (e, name: string, content: string) => {
//     return outputFile(path.join(app.getAppPath(), "save", api.getSteamID().toString(), name), content);
//  });

import type { App } from "electron";
import { outputFile, readFile } from "fs-extra";
import path from "path";
import type { SteamAPI } from "./SteamAPI";

//  ipcMain.handle("readTextFromFile", (e, name: string) => {
//     return readFile(path.join(app.getAppPath(), "save", api.getSteamID().toString(), name));
//  });

//  ipcMain.handle("getAuthSessionTicket", (e) => {
//     return api.getAuthSessionTicket();
//  });

//  ipcMain.handle("getAppID", (e) => {
//     return api.getAppID();
//  });

export class IPCService {
   private _app: Electron.App;
   private _api: SteamAPI;

   constructor(app: App, api: SteamAPI) {
      this._app = app;
      this._api = api;
   }

   public writeTextToFile(name: string, content: string): void {
      outputFile(path.join(this._app.getAppPath(), "save", this._api.getSteamID().toString(), name), content);
   }

   public async readTextFromFile(name: string): Promise<string> {
      const content = await readFile(
         path.join(this._app.getAppPath(), "save", this._api.getSteamID().toString(), name)
      );
      return content.toString("utf-8");
   }

   public getAuthSessionTicket(): Promise<string> {
      return this._api.getAuthSessionTicket();
   }

   public getAppID(): number {
      return this._api.getAppID();
   }
}
