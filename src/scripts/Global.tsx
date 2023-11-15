import { Config } from "./logic/Constants";
import { GameOptions, GameState, initializeGameState, SavedGame } from "./logic/GameState";
import { makeBuilding } from "./logic/Tile";
import { isSteam, SteamClient } from "./rpc/SteamClient";
import { Grid } from "./scenes/Grid";
import { LoadingPage } from "./ui/LoadingPage";
import { idbGet, idbSet } from "./utilities/BrowserStorage";
import { forEach } from "./utilities/Helper";
import { makeObservableHook } from "./utilities/Hook";
import { RouteTo } from "./utilities/Singleton";
import { TypedEvent } from "./utilities/TypedEvent";
import { playError } from "./visuals/Sound";

const savedGame = new SavedGame();

export function wipeSaveData() {
   saving = true;
   const save = new SavedGame();
   save.options = savedGame.options;
   initializeGameState(
      save.current,
      new Grid(Config.City[save.current.city].size, Config.City[save.current.city].size, 64)
   );
   if (isSteam()) {
      SteamClient.fileWrite(SAVE_KEY, JSON.stringify(save))
         .catch(console.error)
         .finally(() => window.location.reload());
      return;
   }
   idbSet(SAVE_KEY, save)
      .catch(console.error)
      .finally(() => window.location.reload());
}

if (import.meta.env.DEV) {
   // @ts-expect-error
   window.loadSave = (content: any) => {
      saving = true;
      Object.assign(savedGame, content);
      idbSet(SAVE_KEY, savedGame)
         .then(() => window.location.reload())
         .catch(console.error);
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
         gs.options.themeColors = Object.assign(savedGame.options.themeColors, gs.options.themeColors);
         Object.assign(savedGame.options, gs.options);
         resolve(true);
      }
   });
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
