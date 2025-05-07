import { Preferences } from "@capacitor/preferences";
import type { Application } from "pixi.js";
import type { City } from "../../shared/definitions/CityDefinitions";
import { NoPrice, NoStorage } from "../../shared/definitions/ResourceDefinitions";
import type { TechAge } from "../../shared/definitions/TechDefinitions";
import { exploreTile, getBuildingCost } from "../../shared/logic/BuildingLogic";
import { Config } from "../../shared/logic/Config";
import type { GameOptions, SavedGame } from "../../shared/logic/GameState";
import { GameState } from "../../shared/logic/GameState";
import {
   GameOptionsChanged,
   GameStateChanged,
   deserializeSave,
   getGameOptions,
   getGameState,
   notifyGameStateUpdate,
   savedGame,
   serializeSave,
   serializeSaveLite,
} from "../../shared/logic/GameStateLogic";
import { initializeGameState } from "../../shared/logic/InitializeGameState";
import {
   getGreatPeopleChoiceCount,
   rollGreatPeopleThisRun,
   rollPermanentGreatPeople,
} from "../../shared/logic/RebirthLogic";
import { Tick } from "../../shared/logic/TickLogic";
import {
   base64ToBytes,
   bytesToBase64,
   clamp,
   forEach,
   rejectIn,
   safeAdd,
   sizeOf,
} from "../../shared/utilities/Helper";
import { TypedEvent } from "../../shared/utilities/TypedEvent";
import { migrateSavedGame } from "./MigrateSavedGame";
import { tickEverySecond } from "./logic/ClientUpdate";
import { CLIENT_ID, client } from "./rpc/RPCClient";
import { SteamClient, isSteam } from "./rpc/SteamClient";
import { WorldScene } from "./scenes/WorldScene";
import { showToast } from "./ui/GlobalModal";
import { idbDel, idbGet, idbSet } from "./utilities/BrowserStorage";
import { makeObservableHook } from "./utilities/Hook";
import { isAndroid, isIOS } from "./utilities/Platforms";
import { Singleton } from "./utilities/Singleton";
import { compress, decompress } from "./workers/Compress";

export async function resetToCity(city: City): Promise<void> {
   savedGame.current = new GameState();
   savedGame.current.city = city;
   initializeGameState(savedGame.current, savedGame.options);
   try {
      await Promise.race([
         client.tickV2(savedGame.current.id, savedGame.current.tick),
         rejectIn(10, "Connection timeout"),
      ]);
   } catch (e) {
      showToast(String(e));
   }
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

const SAVE_KEY = "CivIdle";

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
      const compressed = await compressSave(savedGame);
      if (isSteam()) {
         await SteamClient.fileWriteBytes(SAVE_KEY, compressed);
      } else if (isAndroid() || isIOS()) {
         await Preferences.set({ key: SAVE_KEY, value: bytesToBase64(compressed) });
      } else {
         await idbSet(SAVE_KEY, compressed);
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
         const bytes = await SteamClient.fileReadBytes(SAVE_KEY);
         return await decompressSave(new Uint8Array(bytes));
      }
      if (isAndroid() || isIOS()) {
         const string = (await Preferences.get({ key: SAVE_KEY })).value;
         if (!string) {
            return null;
         }
         return await decompressSave(base64ToBytes(string));
      }
      const compressed = await idbGet<Uint8Array>(SAVE_KEY);
      if (!compressed) {
         throw new Error("Save does not exists");
      }
      return await decompressSave(compressed);
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

let resourceWatchVisible = false;
export const ResourceWatchVisibleChanged = new TypedEvent<boolean>();
ResourceWatchVisibleChanged.on((mode) => {
   resourceWatchVisible = mode;
});
export const useResourceWatchVisible = makeObservableHook(
   ResourceWatchVisibleChanged,
   () => resourceWatchVisible,
);

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

if (import.meta.env.DEV) {
   // @ts-expect-error
   window.savedGame = savedGame;
   // @ts-expect-error
   window.clearGame = async () => {
      if (isSteam()) {
         await SteamClient.fileDelete(SAVE_KEY);
         return;
      }
      await idbDel(SAVE_KEY);
      await idbDel(CLIENT_ID);
      window.location.reload();
   };
   // @ts-expect-error
   window.clearAllResources = () => {
      getGameState().tiles.forEach((tile) => {
         if (tile.building) {
            tile.building.resources = {};
         }
      });
   };
   // @ts-expect-error
   window.saveGame = () => {
      saveGame().then(() => window.location.reload());
   };
   // @ts-expect-error
   window.rollPermanentGreatPeople = (rollCount: number, age: TechAge) => {
      const gs = getGameState();
      rollPermanentGreatPeople(
         rollCount,
         clamp(Math.floor(rollCount / sizeOf(Config.GreatPerson)), 1, Number.POSITIVE_INFINITY),
         getGreatPeopleChoiceCount(gs),
         age,
         gs.city,
      ).forEach((gp) => {
         getGameOptions().greatPeopleChoicesV2.push(gp);
      });
   };
   // @ts-expect-error
   window.cameraPan = (target: number, time: number) => {
      Singleton().sceneManager.getCurrent(WorldScene)?.cameraPan(target, time);
   };
   // @ts-expect-error
   window.rollGreatPeople = (age: TechAge, candidate: number) => {
      const gs = getGameState();
      const candidates = rollGreatPeopleThisRun(new Set([age]), getGameState().city, candidate);
      if (candidates) {
         gs.greatPeopleChoicesV2.push(candidates);
      }
      notifyGameStateUpdate(gs);
   };

   // @ts-expect-error
   window.completeBuilding = (xy: Tile) => {
      const building = getGameState().tiles.get(xy)?.building;
      if (building) {
         forEach(getBuildingCost(building), (res, amount) => {
            building.resources[res] = amount;
         });
      }
   };

   // @ts-expect-error
   window.revealAllTiles = () => {
      const gs = getGameState();
      gs.tiles.forEach((tile, xy) => {
         if (!tile.explored) {
            exploreTile(xy, gs);
            Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(xy));
         }
      });
   };

   // @ts-expect-error
   window.revealTile = (xy: Tile) => {
      const gs = getGameState();
      exploreTile(xy, gs);
      Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(xy));
   };

   // @ts-expect-error
   window.heartbeat = () => {
      Singleton().heartbeat.update(serializeSaveLite());
   };

   // @ts-expect-error
   window.tickGameState = (tick: number) => {
      const gs = getGameState();
      for (let i = 0; i < tick; i++) {
         tickEverySecond(gs, true);
      }
   };
   // @ts-expect-error
   window.benchmarkTick = (tick: number) => {
      console.time(`TickGameState(${tick})`);
      const gs = getGameState();
      for (let i = 0; i < tick; i++) {
         tickEverySecond(gs, true);
      }
      console.timeEnd(`TickGameState(${tick})`);
   };
   // @ts-expect-error
   window.addAllResources = (amount: number) => {
      forEach(Config.Resource, (res, def) => {
         if (NoStorage[res] || NoPrice[res]) {
            return;
         }
         safeAdd(Tick.current.specialBuildings.get("Headquarter")!.building.resources, res, amount);
      });
   };

   // @ts-expect-error
   window.Config = Config;

   // @ts-expect-error
   window.hq = () => Tick.current.specialBuildings.get("Headquarter");
}
