import type { City } from "../../shared/definitions/CityDefinitions";
import type { TechAge } from "../../shared/definitions/TechDefinitions";
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
import { makeBuilding } from "../../shared/logic/Tile";
import { Grid } from "../../shared/utilities/Grid";
import { firstKeyOf, forEach } from "../../shared/utilities/Helper";
import { TypedEvent } from "../../shared/utilities/TypedEvent";
import { SteamClient, isSteam } from "./rpc/SteamClient";
import { WorldScene } from "./scenes/WorldScene";
import { idbDel, idbGet, idbSet } from "./utilities/BrowserStorage";
import { makeObservableHook } from "./utilities/Hook";
import { Singleton } from "./utilities/Singleton";
import { compress, decompress } from "./workers/Compress";

export function wipeSaveData() {
   resetToCity(firstKeyOf(Config.City)!);
   savedGame.options.greatPeople = {};
   savedGame.options.greatPeopleChoices = [];
   saveGame(true).catch(console.error);
}

export function resetToCity(city: City): void {
   savedGame.current = new GameState();
   savedGame.current.city = city;
   const size = Config.City[savedGame.current.city].size;
   initializeGameState(savedGame.current, new Grid(size, size, TILE_SIZE));
}

export function loadSave(save: SavedGame): void {
   saving = true;
   Object.assign(savedGame, save);
   saveGame(true).catch(console.error);
}

if (import.meta.env.DEV) {
   // @ts-expect-error
   window.savedGame = savedGame;
   // @ts-expect-error
   window.clearGame = async () => {
      saving = true;
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
      if (age) {
         gs.greatPeopleChoices.push(getGreatPeopleChoices(age));
      }
      notifyGameStateUpdate(gs);
   };
}

export const OnUIThemeChanged = new TypedEvent<boolean>();
export const ToggleChatWindow = new TypedEvent<boolean>();

export function syncUITheme(gameOptions: GameOptions): void {
   gameOptions.useModernUI ? document.body.classList.add("modern") : document.body.classList.remove("modern");
   OnUIThemeChanged.emit(getGameOptions().useModernUI);
}

const SAVE_KEY = "CivIdle";

let saving = false;

export function saveGame(forceAndReload: boolean): Promise<void> {
   if (!forceAndReload && saving) {
      return Promise.reject(
         "Received a save request while another one is ongoing, will ignore the new request",
      );
   }
   saving = true;
   function cleanup() {
      if (forceAndReload) {
         window.location.reload();
      } else {
         saving = false;
      }
   }
   if (isSteam()) {
      return compressSave(savedGame)
         .then((compressed) => {
            return SteamClient.fileWriteBytes(SAVE_KEY, compressed);
         })
         .catch(console.error)
         .finally(cleanup);
   }
   return compressSave(savedGame)
      .then((compressed) => {
         idbSet(SAVE_KEY, compressed).catch(console.error).finally(cleanup);
      })
      .catch(console.error)
      .finally(cleanup);
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
   if (save.options.chatSendChannel) {
      save.options.chatReceiveChannel[save.options.chatSendChannel] = true;
   }
}
