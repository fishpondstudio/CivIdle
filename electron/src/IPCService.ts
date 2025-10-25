import { app, shell, type BrowserWindow } from "electron";
import { exists, outputFile, readFile, unlink } from "fs-extra";
import { rename } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { deflateRaw } from "node:zlib";
import { MIN_HEIGHT, MIN_WIDTH, getGameSavePath, getLocalGameSavePath, type SteamClient } from ".";

const BACKUP_FREQ = 1000 * 60 * 10;

export class IPCService {
   private _client: SteamClient;
   private _mainWindow: BrowserWindow;
   private _checksum: string;

   constructor(steam: SteamClient, mainWindow: BrowserWindow, checksum: string) {
      this._client = steam;
      this._mainWindow = mainWindow;
      this._checksum = checksum;
   }

   public async fileWrite(name: string, content: string): Promise<void> {
      await outputFile(path.join(getGameSavePath(), this.getSteamId(), name), content);
   }

   private counter = 0;
   private lastWriteAt = Date.now();

   public async fileWriteBytes(name: string, content: Uint8Array): Promise<void> {
      if (content.byteLength <= 0) return;
      const buffer = Buffer.from(content);

      // To make it more reliable, we first write to a temporary file, then copy it over to the main save file
      const tempFile = `${name}.tmp`;
      const tempPath = path.join(getGameSavePath(), this.getSteamId(), tempFile);
      await outputFile(tempPath, buffer);
      await rename(tempPath, path.join(getGameSavePath(), this.getSteamId(), name));

      if (Date.now() - this.lastWriteAt > BACKUP_FREQ) {
         const backup = `${name}_${(++this.counter % 10) + 1}`;
         await outputFile(path.join(getLocalGameSavePath(), this.getSteamId(), backup), buffer);
         this.lastWriteAt = Date.now();
      }
   }

   public async fileWriteCompressed(name: string, content: string): Promise<void> {
      const compress = promisify(deflateRaw);
      const compressed = await compress(content);
      await this.fileWriteBytes(name, compressed);
   }

   public async fileRead(name: string): Promise<string> {
      const content = await readFile(path.join(getGameSavePath(), this.getSteamId(), name));
      return content.toString("utf-8");
   }

   public async fileReadBytes(name: string): Promise<ArrayBuffer> {
      const content = await readFile(path.join(getGameSavePath(), this.getSteamId(), name));
      return content.buffer;
   }

   public async fileDelete(name: string): Promise<void> {
      const filePath = path.join(getGameSavePath(), this.getSteamId(), name);
      if (await exists(filePath)) {
         unlink(filePath);
      }
   }

   public openUrl(url: string): void {
      shell.openExternal(url);
   }

   public getSteamId(): string {
      return this._client.localplayer.getSteamId().steamId64.toString();
   }

   public getChecksum(): string {
      return this._checksum;
   }

   public async getAuthSessionTicket(): Promise<string> {
      return (await this._client.auth.getAuthTicketForWebApi("")).getBytes().toString("hex");
   }

   public getAppId(): number {
      return this._client.utils.getAppId();
   }

   public getBetaName(): string {
      return this._client.apps.currentBetaName() ?? "";
   }

   public openMainSaveFolder(): void {
      shell.openPath(path.join(getGameSavePath(), this.getSteamId()));
   }

   public openBackupSaveFolder(): void {
      shell.openPath(path.join(getLocalGameSavePath(), this.getSteamId()));
   }

   public openLogFolder(): void {
      shell.openPath(getLocalGameSavePath());
   }

   public unlockAchievement(key: string): boolean {
      return this._client.achievement.activate(key);
   }

   public quit(): void {
      app.exit(0);
   }

   public minimize(): void {
      this._mainWindow.minimize();
   }

   public maximize(): void {
      this._mainWindow.maximize();
   }

   public restore(): void {
      this._mainWindow.restore();
   }

   public isMaximized(): boolean {
      return this._mainWindow.isMaximized();
   }

   public setSize(width: number, height: number): void {
      this._mainWindow.setMinimumSize(width, height);
      this._mainWindow.setContentSize(width, height);
   }

   public enterFloatingMode(): void {
      this._mainWindow.setResizable(false);
      this._mainWindow.setAlwaysOnTop(true);
   }

   public exitFloatingMode(): void {
      this._mainWindow.setResizable(true);
      this._mainWindow.setAlwaysOnTop(false);
      this._mainWindow.setMinimumSize(MIN_WIDTH, MIN_HEIGHT);
   }

   public setRichPresence(key: string, value?: string | undefined | null): void {
      this._client.localplayer.setRichPresence(key, value);
   }
}
