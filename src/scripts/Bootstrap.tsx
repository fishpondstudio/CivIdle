import { Application, Ticker } from "pixi.js";
import {
   TILE_SIZE,
   getGameOptions,
   getGameState,
   isGameDataCompatible,
   loadGame,
   notifyGameStateUpdate,
   syncUITheme,
} from "./Global";
import { RouteChangeEvent } from "./Route";
import { checkSteamBranch } from "./SteamTesting";
import { Building } from "./definitions/BuildingDefinitions";
import { City } from "./definitions/CityDefinitions";
import { getBuildingTexture } from "./logic/BuildingLogic";
import { Config, calculateTierAndPrice } from "./logic/Constants";
import { GameState, initializeGameState } from "./logic/GameState";
import { ITileData } from "./logic/Tile";
import { shouldTick, tickEveryFrame, tickEverySecond } from "./logic/Update";
import { MainBundleAssets } from "./main";
import { connectWebSocket } from "./rpc/RPCClient";
import { Grid } from "./scenes/Grid";
import { WorldScene } from "./scenes/WorldScene";
import { showModal, showToast } from "./ui/GlobalModal";
import { LoadingPage, LoadingPageStage } from "./ui/LoadingPage";
import { OfflineProductionModal } from "./ui/OfflineProductionModal";
import { clamp, forEach, isNullOrUndefined, rejectIn, schedule } from "./utilities/Helper";
import { SceneManager, Textures } from "./utilities/SceneManager";
import { ISpecialBuildings, RouteTo, Singleton, initializeSingletons } from "./utilities/Singleton";
import { TypedEvent } from "./utilities/TypedEvent";
import Actions from "./utilities/pixi-actions/Actions";
import { playError } from "./visuals/Sound";

export async function startGame(
   app: Application,
   resources: MainBundleAssets,
   textures: Textures,
   routeChanged: TypedEvent<RouteChangeEvent>
) {
   const routeTo: RouteTo = (component, params) => routeChanged.emit({ component, params });

   // ========== Load game data ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.LoadSave });

   let isNewPlayer = false;
   const data = await loadGame();
   if (data && isGameDataCompatible(data, routeTo)) {
      // Nothing to do yet
   } else {
      isNewPlayer = true;
   }

   // ========== Game data is loaded ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.CheckSave });
   const gameState = getGameState();
   verifyBuildingConfig(textures, gameState.city);
   const size = Config.City[gameState.city].size;
   const grid = new Grid(size, size, TILE_SIZE);
   if (isNewPlayer) {
      initializeGameState(gameState, grid);
   }

   // ========== Game state is initialized ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.CheckSave });
   syncUITheme(getGameOptions());
   calculateTierAndPrice(gameState);
   initializeSingletons({
      sceneManager: new SceneManager({ app, assets: resources, textures, gameState }),
      buildings: findSpecialBuildings(gameState) as ISpecialBuildings,
      grid,
      routeTo,
   });

   // ========== Connect to server ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.SteamSignIn });
   const TIMEOUT = import.meta.env.DEV ? 1 : 5;
   try {
      const offlineTime = clamp(
         await Promise.race([connectWebSocket(), rejectIn<number>(TIMEOUT, "Connection Timeout")]),
         0,
         60 * 60 * 8
      );
      routeTo(LoadingPage, { stage: LoadingPageStage.OfflineProduction });

      if (offlineTime >= 60) {
         const before = JSON.parse(JSON.stringify(gameState));
         let timeLeft = offlineTime;
         while (timeLeft > 0) {
            const batchSize = Math.min(offlineTime, 100);
            await schedule(() => {
               for (let i = 0; i < batchSize; i++) {
                  tickEverySecond(gameState, true);
               }
            });
            await showOfflineProductionProgress(1 - timeLeft / offlineTime, routeTo);
            timeLeft -= batchSize;
         }
         const after = JSON.parse(JSON.stringify(gameState));
         showModal(<OfflineProductionModal before={before} after={after} time={offlineTime} />);
      }
   } catch (error) {
      playError();
      showToast(String(error));
   }

   // We tick first before loading scene, making sure city-specific overrides are applied!
   tickEverySecond(gameState, false);

   if (import.meta.env.DEV) {
      // createRoot(document.getElementById("debug-ui")!).render(<GreatPersonDebug />);
   }

   // Singleton().sceneManager.loadScene(FlowGraphScene);
   Singleton().sceneManager.loadScene(WorldScene);
   // Singleton().sceneManager.loadScene(TechTreeScene);

   notifyGameStateUpdate();

   startTicker(app.ticker, gameState);

   await checkSteamBranch();
}

function showOfflineProductionProgress(progress: number, routeTo: RouteTo): Promise<void> {
   return new Promise((resolve) => {
      routeTo(LoadingPage, {
         stage: LoadingPageStage.OfflineProduction,
         progress: progress,
         onload: () => schedule(resolve),
      });
   });
}

function startTicker(ticker: Ticker, gameState: GameState) {
   ticker.add(() => {
      if (!shouldTick()) {
         return;
      }
      const dt = ticker.elapsedMS / 1000;
      Actions.tick(dt);
      tickEveryFrame(gameState, dt);
   });

   setInterval(tickEverySecond.bind(null, gameState, false), 1000);
}

function findSpecialBuildings(gameState: GameState): Partial<Record<Building, ITileData>> {
   const buildings: Partial<Record<Building, ITileData>> = {};
   forEach(gameState.tiles, (_, tile) => {
      if (tile.building?.type === "Headquarter") {
         console.assert(
            buildings.Headquarter === undefined,
            "There should be only one Headquarter. One =",
            buildings.Headquarter,
            "Another = ",
            tile
         );
         buildings.Headquarter = tile;
      }
   });
   console.assert(buildings.Headquarter, "Should find 1 Headquarter");
   return buildings;
}

function verifyBuildingConfig(textures: Textures, city: City) {
   forEach(Config.Building, (b, def) => {
      if (!getBuildingTexture(b, textures, city)) {
         console.warn(`Cannot find textures for building ${b}`);
      }
      if (!isNullOrUndefined(def.max) && isNullOrUndefined(def.special)) {
         console.warn(`Building ${b} has "max" defined but "special" undefined. Please define "special"!`);
      }
   });
}
