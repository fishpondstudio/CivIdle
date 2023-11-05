import { Config } from "./logic/Constants";
import { GameOptions, GameState, SavedGame } from "./logic/GameState";
import { ITileData, makeBuilding } from "./logic/Tile";
import { isSteam, SteamClient } from "./rpc/SteamClient";
import { Grid } from "./scenes/Grid";
import { LoadingPage } from "./ui/LoadingPage";
import { idbClear, idbGet, idbSet } from "./utilities/BrowserStorage";
import { forEach } from "./utilities/Helper";
import { makeObservableHook } from "./utilities/Hook";
import { SceneManager } from "./utilities/SceneManager";
import { TypedEvent } from "./utilities/TypedEvent";
import { playError } from "./visuals/Sound";

export type RouteTo = <P extends Record<string, unknown>>(component: React.ComponentType<P>, params: P) => void;

export interface ISingleton {
   sceneManager: SceneManager;
   grid: Grid;
   buildings: ISpecialBuildings;
   routeTo: RouteTo;
}

export interface ISpecialBuildings {
   Headquarter: Required<ITileData>;
}

let singletons: ISingleton | null = null;

export function initializeSingletons(s: ISingleton) {
   if (singletons != null) {
      console.warn("Singletons are already initialized, you are trying to initialize it again!");
   }
   singletons = s;
}

export function isSingletonReady() {
   return singletons !== null;
}

export function Singleton(): ISingleton {
   if (singletons == null) {
      throw new Error("Singletons are not initialized yet!");
   }
   return singletons;
}

const savedGame = new SavedGame();

export function wipeSaveData() {
   saving = true;
   if (isSteam()) {
      SteamClient.fileDelete(SAVE_KEY).then(() => window.location.reload());
      return;
   }
   idbClear()
      .then(() => window.location.reload())
      .catch(console.error);
}

if (import.meta.env.DEV) {
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
}

export const GameStateChanged = new TypedEvent<GameState>();

export function getGameState(): GameState {
   return savedGame.current;
}

export function getGameOptions(): GameOptions {
   return savedGame.options;
}

export const OnUIThemeChanged = new TypedEvent<boolean>();

export function syncUITheme(): void {
   getGameOptions().useModernUI ? document.body.classList.add("modern") : document.body.classList.remove("modern");
   OnUIThemeChanged.emit(getGameOptions().useModernUI);
}

const SAVE_KEY = "CivIdle";

let saving = false;

export function saveGame() {
   if (saving) {
      console.warn("Received a save request while another one is ongoing, will ignore the new request");
      return;
   }
   saving = true;
   if (isSteam()) {
      SteamClient.fileWrite(SAVE_KEY, JSON.stringify(savedGame))
         .catch(console.error)
         .finally(() => (saving = false));
      return;
   }
   idbSet(SAVE_KEY, savedGame)
      .catch(console.error)
      .finally(() => (saving = false));
}

export async function loadGame(): Promise<SavedGame | undefined> {
   if (isSteam()) {
      try {
         return JSON.parse(await SteamClient.fileRead(SAVE_KEY)) as SavedGame;
      } catch (e) {
         console.warn("loadGame failed", e);
      }
      return;
   }
   return await idbGet<SavedGame>(SAVE_KEY);
}

export function isGameDataCompatible(gs: SavedGame, routeTo: RouteTo): Promise<boolean> {
   return new Promise((resolve, reject) => {
      if (savedGame.options.version !== gs.options.version) {
         playError();
         routeTo(LoadingPage, {
            message: {
               content: (
                  <>
                     Error: Your save is incompatible
                     <br />
                     Press F to WIPE and continue
                  </>
               ),
               continue: () => {
                  resolve(false);
               },
            },
         });
      } else {
         migrateSavedGame(gs);
         Object.assign(savedGame.current, gs.current);
         Object.assign(savedGame.options, gs.options);
         resolve(true);
      }
   });
}

export function notifyGameStateUpdate(): void {
   GameStateChanged.emit({ ...getGameState() });
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

export const useGameState = makeObservableHook(GameStateChanged, getGameState);

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
