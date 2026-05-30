import { Preferences } from "@capacitor/preferences";
import { type Application } from "pixi.js";
import type { City } from "../../shared/definitions/CityDefinitions";
import { Config } from "../../shared/logic/Config";
import type { GameOptions, SavedGame } from "../../shared/logic/GameState";
import { GameState } from "../../shared/logic/GameState";
import {
   GameOptionsChanged,
   GameStateChanged,
   deserializeSave,
   getGameOptions,
   getGameState,
   savedGame,
   serializeSave,
} from "../../shared/logic/GameStateLogic";
import { initializeGameState } from "../../shared/logic/InitializeGameState";
import { Transports } from "../../shared/logic/Transports";
import { base64ToBytes } from "../../shared/utilities/Helper";
import { TypedEvent } from "../../shared/utilities/TypedEvent";
import { migrateSavedGame } from "./MigrateSavedGame";
import { SteamClient, isSteam } from "./rpc/SteamClient";
import { idbClear, idbGet, idbSet } from "./utilities/BrowserStorage";
import { makeObservableHook } from "./utilities/Hook";
import { isAndroid, isIOS } from "./utilities/Platforms";
import { compress, decompress } from "./workers/Compress";

export async function resetToCity(id: string, city: City, extraTileSize: number): Promise<void> {
   Transports.length = 0;
   savedGame.current = new GameState();
   savedGame.current.id = id;
   savedGame.current.city = city;
   savedGame.current.mapSize = Config.City[city].size + extraTileSize;
   initializeGameState(savedGame.current, savedGame.options);
}

export function overwriteSaveGame(save: SavedGame): void {
   Object.assign(savedGame, save);
}

export const OnUIThemeChanged = new TypedEvent<boolean>();
export const ToggleChatWindow = new TypedEvent<boolean>();

export function syncUITheme(gameOptions: GameOptions): void {
   gameOptions.useModernUI ? document.body.classList.add("modern") : document.body.classList.remove("modern");
   switch (gameOptions.cursor) {
      case "BigOldFashioned":
         document.body.classList.add("big-old-fashioned-cursor");
         break;
      case "OldFashioned":
         document.body.classList.add("old-fashioned-cursor");
         break;
      case "System":
         break;
      default:
         document.body.classList.add("old-fashioned-cursor");
   }
   OnUIThemeChanged.emit(getGameOptions().useModernUI);
}

export function syncSidePanelWidth(app: Application, options: GameOptions): void {
   const width = isAndroid() || isIOS() ? options.sidePanelWidthMobile : options.sidePanelWidth;
   document.documentElement.style.setProperty("--game-ui-width", `${width / 10}rem`);
   app.resize();
}

export function syncFontSizeScale(app: Application, options: GameOptions): void {
   if (!options.useModernUI) {
      document.documentElement.style.setProperty("--base-font-size", "62.5%");
      return;
   }
   const scale = isAndroid() || isIOS() ? options.fontSizeScaleMobile : options.fontSizeScale;
   document.documentElement.style.setProperty("--base-font-size", `${scale * 62.5}%`);
   app.resize();
}

export function syncFontVariantNumeric(options: GameOptions): void {
   document.documentElement.style.setProperty(
      "--font-variant-numeric",
      options.useMonospaceNumbers ? "tabular-nums" : "normal",
   );
}

const SaveKey = "CivIdle";
const SaveKeyNew = "CivIdleNew";

interface ISaveGameTask {
   resolve: () => void;
   reject: (err: any) => void;
}

const saveGameQueue: ISaveGameTask[] = [];

export async function saveGame(): Promise<void> {
   let resolve: (() => void) | null = null;
   let reject: (() => void) | null = null;

   const promise = new Promise<void>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
   });

   saveGameQueue.push({ resolve: resolve!, reject: reject! });

   if (saveGameQueue.length === 1) {
      doSaveGame(saveGameQueue[0]);
   }

   return promise;
}

export async function doSaveGame(task: ISaveGameTask): Promise<void> {
   try {
      if (isSteam()) {
         const serialized = serializeSave(savedGame);
         await SteamClient.fileWriteCompressed(SaveKey, serialized);
      } else if (isAndroid() || isIOS()) {
         await Preferences.set({ key: SaveKeyNew, value: serializeSave(savedGame) });
      } else {
         await idbSet(SaveKeyNew, serializeSave(savedGame));
      }
      task.resolve();
   } catch (error) {
      task.reject(error);
   } finally {
      const index = saveGameQueue.indexOf(task);
      if (index !== -1) {
         saveGameQueue.splice(index, 1);
      }
      if (saveGameQueue.length > 0) {
         doSaveGame(saveGameQueue[0]);
      }
   }
}

export async function hardReset(): Promise<void> {
   if (isSteam()) {
      await SteamClient.fileDelete(SaveKey);
   } else if (isAndroid() || isIOS()) {
      await Preferences.clear();
   } else {
      await idbClear();
   }
}

export async function compressSave(gs: SavedGame = savedGame): Promise<Uint8Array> {
   return await compress(new TextEncoder().encode(serializeSave(gs)));
}

export async function decompressSave(data: Uint8Array): Promise<SavedGame> {
   return deserializeSave(new TextDecoder().decode(await decompress(data)));
}

export async function loadGame(): Promise<SavedGame | null> {
   try {
      console.time("Loading Save file");
      if (isSteam()) {
         const bytes = await SteamClient.fileReadBytes(SaveKey);
         const save = await decompressSave(new Uint8Array(bytes));
         return save;
      }
      if (isAndroid() || isIOS()) {
         const string = (await Preferences.get({ key: SaveKeyNew })).value;
         if (string) {
            const save = deserializeSave(string);
            return save;
         }
         const oldSaveString = (await Preferences.get({ key: SaveKey })).value;
         if (oldSaveString) {
            const save = await decompressSave(base64ToBytes(oldSaveString));
            return save;
         }
         return null;
      }
      const string = await idbGet<string>(SaveKeyNew);
      if (string) {
         const save = deserializeSave(string);
         return save;
      }
      const oldSaveBytes = await idbGet<Uint8Array>(SaveKey);
      if (oldSaveBytes) {
         const save = await decompressSave(oldSaveBytes);
         return save;
      }
      return null;
   } catch (e) {
      console.warn("loadGame failed", e);
      return null;
   } finally {
      console.timeEnd("Loading Save file");
   }
}

export function isGameDataCompatible(gs: SavedGame): boolean {
   if (savedGame.options.version !== gs.options.version) {
      return false;
   }
   migrateSavedGame(gs);
   Object.assign(savedGame.current, gs.current);
   gs.options.themeColors = Object.assign(savedGame.options.themeColors, gs.options.themeColors);
   Object.assign(savedGame.options, gs.options);
   return true;
}

export const useGameState = makeObservableHook(GameStateChanged, getGameState);
export const useGameOptions = makeObservableHook(GameOptionsChanged, getGameOptions);

let floatingMode = false;
export const FloatingModeChanged = new TypedEvent<boolean>();
FloatingModeChanged.on((mode) => {
   floatingMode = mode;
});
export const useFloatingMode = makeObservableHook(FloatingModeChanged, () => floatingMode);

export function getProductionPriority(v: number): number {
   return v & 0x0000ff;
}

function setProductionPriority(priority: number, v: number): number {
   return (priority & 0xffff00) | (v & 0xff);
}

export function getConstructionPriority(v: number): number {
   return (v & 0x00ff00) >> 8;
}

function setConstructionPriority(priority: number, v: number): number {
   return (priority & 0xff00ff) | ((v & 0xff) << 8);
}

function getUpgradePriority(v: number): number {
   return (v & 0xff0000) >> 16;
}

function setUpgradePriority(priority: number, v: number): number {
   return (priority & 0x00ffff) | ((v & 0xff) << 16);
}
