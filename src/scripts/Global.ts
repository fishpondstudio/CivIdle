import { City } from "./definitions/CityDefinitions";
import { Config } from "./logic/Constants";
import { GameOptions, GameState, SavedGame, initializeGameState } from "./logic/GameState";
import { rollGreatPeople } from "./logic/RebornLogic";
import { makeBuilding } from "./logic/Tile";
import { SteamClient, isSteam } from "./rpc/SteamClient";
import { Grid } from "./scenes/Grid";
import { WorldScene } from "./scenes/WorldScene";
import { idbGet, idbSet } from "./utilities/BrowserStorage";
import { firstKeyOf, forEach } from "./utilities/Helper";
import { makeObservableHook } from "./utilities/Hook";
import { Singleton } from "./utilities/Singleton";
import { TypedEvent } from "./utilities/TypedEvent";

const savedGame = new SavedGame();

export const TILE_SIZE = 64;

export function wipeSaveData() {
   resetToCity(firstKeyOf(Config.City)!);
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
         SteamClient.fileWrite(SAVE_KEY, JSON.stringify(savedGame))
            .then(() => window.location.reload())
            .catch(console.error);
      } else {
         idbSet(SAVE_KEY, savedGame)
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
   window.rollGreatPeople = rollGreatPeople;
   // @ts-expect-error
   window.cameraPan = (target: number, time: number) => {
      Singleton().sceneManager.getCurrent(WorldScene)?.cameraPan(target, time);
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
      return SteamClient.fileWrite(SAVE_KEY, JSON.stringify(savedGame)).catch(console.error).finally(cleanup);
   }
   return idbSet(SAVE_KEY, savedGame).catch(console.error).finally(cleanup);
}

export async function loadGame(): Promise<SavedGame | undefined> {
   try {
      if (isSteam()) {
         return JSON.parse(await SteamClient.fileRead(SAVE_KEY)) as SavedGame;
      }
      return await idbGet<SavedGame>(SAVE_KEY);
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
      forEach(tile.building?.resources, (res) => {
         if (!Config.Resource[res]) {
            delete tile.building!.resources[res];
         }
      });
   });
}
