import { useEffect, useState } from "react";
import { Config } from "./logic/Constants";
import { GameOptions, GameState, SavedGame } from "./logic/GameState";
import { ITileData, makeBuilding } from "./logic/Tile";
import { Grid } from "./scenes/Grid";
import { idbClear, idbGet, idbSet } from "./utilities/BrowserStorage";
import { forEach } from "./utilities/Helper";
import { SceneManager } from "./utilities/SceneManager";
import { TypedEvent } from "./utilities/TypedEvent";

export interface ISingleton {
   sceneManager: SceneManager;
   grid: Grid;
   buildings: SpecialBuildings;
   routeTo: <P extends Record<string, unknown>>(component: React.ComponentType<P>, params: P) => void;
}

export interface SpecialBuildings {
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
      window.location.href = "/";
      throw new Error("Singletons are not initialized yet!");
   }
   return singletons;
}

const savedGame = new SavedGame();

if (import.meta.env.DEV) {
   // @ts-expect-error
   window.savedGame = savedGame;
   // @ts-expect-error
   window.clearGame = () => {
      idbClear()
         .then(() => window.location.reload())
         .catch(console.error);
   };
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

export function syncUITheme(): void {
   getGameOptions().useModernUI ? document.body.classList.add("modern") : document.body.classList.remove("modern");
}

const SAVE_KEY = "CivIdle";

export function saveGame() {
   if (typeof Steamworks !== "undefined") {
      Steamworks.writeTextToFile(SAVE_KEY, JSON.stringify(savedGame));
      return;
   }
   idbSet(SAVE_KEY, savedGame).catch(console.error);
}

export async function loadGame(): Promise<SavedGame | undefined> {
   if (typeof Steamworks !== "undefined") {
      try {
         const content = await Steamworks.readTextFromFile(SAVE_KEY);
         return JSON.parse(content) as SavedGame;
      } catch (e) {
         console.warn("loadGame failed", e);
         return;
      }
   }
   return await idbGet<SavedGame>(SAVE_KEY);
}

export function initializeSavedGame(gs: SavedGame): void {
   migrateSavedGame(gs);
   Object.assign(savedGame.current, gs.current);
   Object.assign(savedGame.options, gs.options);
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

export function useGameState() {
   const [_getGameState, _setGameState] = useState(getGameState());
   useEffect(() => {
      function handleGameStateChanged(gs: GameState) {
         _setGameState(gs);
      }
      handleGameStateChanged(getGameState());
      GameStateChanged.on(handleGameStateChanged);
      return () => {
         GameStateChanged.off(handleGameStateChanged);
      };
   }, []);
   return _getGameState;
}
function migrateSavedGame(gs: SavedGame) {
   forEach(gs.current.tiles, (xy, tile) => {
      if (tile.building) {
         tile.building = makeBuilding(tile.building);
      }
      forEach(tile.building?.resources, (res) => {
         if (!Config.Resource[res]) {
            delete tile.building!.resources[res];
         }
      });
   });
}
