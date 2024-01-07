import type { City } from "./definitions/CityDefinitions";
import type { TechAge } from "./definitions/TechDefinitions";
import { Config } from "./logic/Config";
import type { GameOptions } from "./logic/GameState";
import { GameState, SavedGame, initializeGameState } from "./logic/GameState";
import { rollPermanentGreatPeople } from "./logic/RebornLogic";
import { getGreatPeopleChoices } from "./logic/TechLogic";
import { makeBuilding } from "./logic/Tile";
import { SteamClient, isSteam } from "./rpc/SteamClient";
import { Grid } from "./scenes/Grid";
import { WorldScene } from "./scenes/WorldScene";
import { idbGet, idbSet } from "./utilities/BrowserStorage";
import { firstKeyOf, forEach } from "./utilities/Helper";
import { makeObservableHook } from "./utilities/Hook";
import { Singleton } from "./utilities/Singleton";
import { TypedEvent } from "./utilities/TypedEvent";
import { compress, decompress } from "./workers/Compress";

const savedGame = new SavedGame();

export const TILE_SIZE = 64;

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

if (import.meta.env.DEV) {
   // @ts-expect-error
   window.loadSave = (content: unknown) => {
      saving = true;
      Object.assign(savedGame, content);
      if (isSteam()) {
         compressSave(savedGame)
            .then((b) => SteamClient.fileWriteBytes(SAVE_KEY, b))
            .then(() => window.location.reload())
            .catch(console.error);
      } else {
         compressSave(savedGame)
            .then((b) => idbSet(SAVE_KEY, b))
            .then(() => window.location.reload())
            .catch(console.error);
      }
   };
   // @ts-expect-error
   window.savedGame = savedGame;
   // @ts-expect-error
   window.clearGame = wipeSaveData;
   // @ts-expect-error
   window.clearAllResources = () => {
      forEach(getGameState().tiles, (xy, tile) => {
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

export const GameStateChanged = new TypedEvent<GameState>();
export const GameOptionsChanged = new TypedEvent<GameOptions>();

export function getGameState(): GameState {
   return savedGame.current;
}

export function getGameOptions(): GameOptions {
   return savedGame.options;
}

export const OnUIThemeChanged = new TypedEvent<boolean>();

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

export function serializeSave(gs: SavedGame = savedGame): Uint8Array {
   return new TextEncoder().encode(JSON.stringify(gs));
}

export function deserializeSave(bytes: Uint8Array): SavedGame {
   return JSON.parse(new TextDecoder().decode(bytes));
}

export async function decompressSave(data: Uint8Array): Promise<SavedGame> {
   return deserializeSave(await decompress(data));
}

export async function loadGame(): Promise<SavedGame | undefined> {
   try {
      if (isSteam()) {
         const bytes = await SteamClient.fileReadBytes(SAVE_KEY);
         try {
            // This is for migrating old uncompressed save file. Consider remove this after release!
            return JSON.parse(new TextDecoder().decode(bytes));
         } catch (error) {
            return decompressSave(new Uint8Array(bytes));
         }
      }
      const compressed = await idbGet<Uint8Array>(SAVE_KEY);
      if (!compressed) {
         return;
      }
      return await decompressSave(compressed);
   } catch (e) {
      console.warn("loadGame failed", e);
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

export function notifyGameStateUpdate(gameState?: GameState): void {
   GameStateChanged.emit({ ...(gameState ?? getGameState()) });
}

export function notifyGameOptionsUpdate(gameOptions?: GameOptions): void {
   GameOptionsChanged.emit({ ...(gameOptions ?? getGameOptions()) });
}

export function watchGameState(cb: (gs: GameState) => void): () => void {
   cb(getGameState());
   function handleGameStateChanged(gs: GameState) {
      cb(gs);
   }
   GameStateChanged.on(handleGameStateChanged);
   return () => {
      GameStateChanged.off(handleGameStateChanged);
   };
}

export function watchGameOptions(cb: (gameOptions: GameOptions) => void): () => void {
   cb(getGameOptions());
   function handleGameOptionsChanged(gameOptions: GameOptions) {
      cb(gameOptions);
   }
   GameOptionsChanged.on(handleGameOptionsChanged);
   return () => {
      GameOptionsChanged.off(handleGameOptionsChanged);
   };
}

export const useGameState = makeObservableHook(GameStateChanged, getGameState);
export const useGameOptions = makeObservableHook(GameOptionsChanged, getGameOptions);

function migrateSavedGame(gs: SavedGame) {
   forEach(gs.current.tiles, (xy, tile) => {
      if (tile.building) {
         if (!Config.Building[tile.building.type]) {
            delete tile.building;
         } else {
            tile.building = makeBuilding(tile.building);
         }
      }
      forEach(tile.building?.resources, (res, amount) => {
         if (!Config.Resource[res] || !Number.isFinite(amount)) {
            delete tile.building!.resources[res];
         }
      });
   });
}
