import type { City } from "../../shared/definitions/CityDefinitions";
import type { TechAge } from "../../shared/definitions/TechDefinitions";
import { getBuildingCost } from "../../shared/logic/BuildingLogic";
import { Config } from "../../shared/logic/Config";
import type { GameOptions, SavedGame } from "../../shared/logic/GameState";
import { GameState } from "../../shared/logic/GameState";
import {
   GameOptionsChanged,
   GameStateChanged,
   TILE_SIZE,
   deserializeSave,
   getGameOptions,
   getGameState,
   notifyGameStateUpdate,
   savedGame,
   serializeSave,
} from "../../shared/logic/GameStateLogic";
import { initializeGameState } from "../../shared/logic/InitializeGameState";
import { rollPermanentGreatPeople } from "../../shared/logic/RebornLogic";
import { getGreatPeopleChoices } from "../../shared/logic/TechLogic";
import { BuildingInputMode, makeBuilding } from "../../shared/logic/Tile";
import { Grid } from "../../shared/utilities/Grid";
import { forEach, isNullOrUndefined } from "../../shared/utilities/Helper";
import { TypedEvent } from "../../shared/utilities/TypedEvent";
import { SteamClient, isSteam } from "./rpc/SteamClient";
import { WorldScene } from "./scenes/WorldScene";
import { idbDel, idbGet, idbSet } from "./utilities/BrowserStorage";
import { makeObservableHook } from "./utilities/Hook";
import { Singleton } from "./utilities/Singleton";
import { compress, decompress } from "./workers/Compress";

export function resetToCity(city: City): void {
   savedGame.current = new GameState();
   savedGame.current.city = city;
   const size = Config.City[savedGame.current.city].size;
   initializeGameState(savedGame.current, new Grid(size, size, TILE_SIZE));
}

export function overwriteSaveGame(save: SavedGame): void {
   Object.assign(savedGame, save);
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
   window.saveGame = saveGame;
   // @ts-expect-error
   window.rollPermanentGreatPeople = rollPermanentGreatPeople;
   // @ts-expect-error
   window.cameraPan = (target: number, time: number) => {
      Singleton().sceneManager.getCurrent(WorldScene)?.cameraPan(target, time);
   };
   // @ts-expect-error
   window.rollGreatPeople = (age: TechAge) => {
      const gs = getGameState();
      const candidates = getGreatPeopleChoices(age);
      if (candidates) {
         gs.greatPeopleChoices.push(candidates);
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
}

export const OnUIThemeChanged = new TypedEvent<boolean>();
export const ToggleChatWindow = new TypedEvent<boolean>();

export function syncUITheme(gameOptions: GameOptions): void {
   gameOptions.useModernUI ? document.body.classList.add("modern") : document.body.classList.remove("modern");
   OnUIThemeChanged.emit(getGameOptions().useModernUI);
}

const SAVE_KEY = "CivIdle";

let currentSavePromise: Promise<any> = Promise.resolve();

function cleanUpSavePromise() {
   currentSavePromise = Promise.resolve();
}

export function saveGame(): Promise<void> {
   if (isSteam()) {
      currentSavePromise = currentSavePromise
         .then(() => compressSave(savedGame))
         .then((compressed) => {
            return SteamClient.fileWriteBytes(SAVE_KEY, compressed);
         })
         .catch(console.error)
         .finally(cleanUpSavePromise);
   } else {
      currentSavePromise = currentSavePromise
         .then(() => compressSave(savedGame))
         .then((compressed) => {
            return idbSet(SAVE_KEY, compressed).catch(console.error);
         })
         .catch(console.error)
         .finally(cleanUpSavePromise);
   }
   return currentSavePromise;
}

export async function compressSave(gs: SavedGame = savedGame): Promise<Uint8Array> {
   return await compress(serializeSave(gs));
}

export async function decompressSave(data: Uint8Array): Promise<SavedGame> {
   return deserializeSave(await decompress(data));
}

export async function loadGame(): Promise<SavedGame | null> {
   try {
      if (isSteam()) {
         const bytes = await SteamClient.fileReadBytes(SAVE_KEY);
         return await decompressSave(new Uint8Array(bytes));
      }
      const compressed = await idbGet<Uint8Array>(SAVE_KEY);
      if (!compressed) {
         throw new Error("Save does not exists");
      }
      return await decompressSave(compressed);
   } catch (e) {
      console.warn("loadGame failed", e);
      return null;
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

function migrateSavedGame(save: SavedGame) {
   save.current.tiles.forEach((tile) => {
      if (tile.building) {
         // @ts-expect-error
         if (tile.building.status === "paused") {
            tile.building.status = "building";
         }
         if (!tile.building.disabledInput) {
            tile.building.disabledInput = new Set();
         }
         if (isNullOrUndefined(tile.building.inputMode)) {
            tile.building.inputMode = BuildingInputMode.Distance;
         }
         if (isNullOrUndefined(tile.building.maxInputDistance)) {
            tile.building.maxInputDistance = Infinity;
         }
         if (!Config.Building[tile.building.type]) {
            delete tile.building;
            return;
         }
         tile.building = makeBuilding(tile.building);
         forEach(tile.building.resources, (res, amount) => {
            if (!Config.Resource[res] || !Number.isFinite(amount)) {
               delete tile.building!.resources[res];
            }
         });
      }
   });
   if (isNullOrUndefined(save.current.buildingDefaults)) {
      // @ts-expect-error
      save.current.buildingDefaults = save.options.buildingDefaults;
      // @ts-expect-error
      delete save.options.buildingDefaults;
   }
   if (save.options.chatSendChannel) {
      save.options.chatReceiveChannel[save.options.chatSendChannel] = true;
   }
}
