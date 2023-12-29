import { Application } from "pixi.js";
import { RunTests } from "../tests/TestRunner";
import {
   TILE_SIZE,
   getGameOptions,
   getGameState,
   isGameDataCompatible,
   loadGame,
   notifyGameStateUpdate,
   syncUITheme,
} from "./Global";
import type { RouteChangeEvent } from "./Route";
import { checkSteamBranch } from "./SteamTesting";
import type { Building } from "./definitions/BuildingDefinitions";
import { setCityOverride, type City } from "./definitions/CityDefinitions";
import { DepositResources } from "./definitions/ResourceDefinitions";
import { getBuildingTexture, getStorageFor, getTileTexture } from "./logic/BuildingLogic";
import { Config, MAX_OFFLINE_PRODUCTION_SEC, calculateTierAndPrice } from "./logic/Constants";
import { GameState, initializeGameState } from "./logic/GameState";
import type { IPetraBuildingData, ITileData } from "./logic/Tile";
import { tickEverySecond } from "./logic/Update";
import type { MainBundleAssets } from "./main";
import { connectWebSocket } from "./rpc/RPCClient";
import { Grid } from "./scenes/Grid";
import { TechTreeScene } from "./scenes/TechTreeScene";
import { WorldScene } from "./scenes/WorldScene";
import { ErrorPage } from "./ui/ErrorPage";
import { showModal, showToast } from "./ui/GlobalModal";
import { LoadingPage, LoadingPageStage } from "./ui/LoadingPage";
import { ManageRebornModal } from "./ui/ManageRebornModal";
import { OfflineProductionModal } from "./ui/OfflineProductionModal";
import { GameTicker } from "./utilities/GameTicker";
import { clamp, forEach, isNullOrUndefined, rejectIn, schedule } from "./utilities/Helper";
import { SceneManager, type Textures } from "./utilities/SceneManager";
import { Singleton, initializeSingletons, type ISpecialBuildings, type RouteTo } from "./utilities/Singleton";
import { TypedEvent } from "./utilities/TypedEvent";
import { playError } from "./visuals/Sound";

export async function startGame(
   app: Application,
   resources: MainBundleAssets,
   textures: Textures,
   routeChanged: TypedEvent<RouteChangeEvent>,
) {
   const routeTo: RouteTo = (component, params) => routeChanged.emit({ component, params });

   // ========== Load game data ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.LoadSave });

   let isNewPlayer = false;
   const data = await loadGame();
   if (data) {
      if (!isGameDataCompatible(data)) {
         playError();
         routeTo(ErrorPage, {
            content: (
               <>
                  <div className="title">Save File Incompatible</div>
                  <div>
                     Your currently save file is not compatible with the game version. You need to delete your
                     old save and restart the game.
                  </div>
               </>
            ),
         });
         return;
      }
   } else {
      isNewPlayer = true;
   }

   // ========== Game data is loaded ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.CheckSave });
   const gameState = getGameState();
   verifyTextures(textures, gameState.city);
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
      buildings: findSpecialBuildings(gameState),
      grid,
      routeTo,
      ticker: new GameTicker(app.ticker, gameState),
   });

   setCityOverride(gameState);

   // ========== Connect to server ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.SteamSignIn });
   const TIMEOUT = import.meta.env.DEV ? 1 : 5;
   let hasOfflineProductionModal = false;
   try {
      const actualOfflineTime = await Promise.race([
         connectWebSocket(),
         rejectIn<number>(TIMEOUT, "Connection Timeout"),
      ]);

      const petra = Singleton().buildings.Petra;
      const maxOfflineTime =
         ((petra?.building as IPetraBuildingData | undefined)?.offlineProductionPercent ?? 1) *
         MAX_OFFLINE_PRODUCTION_SEC;
      const offlineTime = clamp(actualOfflineTime, 0, maxOfflineTime);

      routeTo(LoadingPage, { stage: LoadingPageStage.OfflineProduction });
      if (offlineTime >= 60) {
         const before = structuredClone(gameState);
         let timeLeft = offlineTime;
         while (timeLeft > 0) {
            const batchSize = Math.min(offlineTime, MAX_OFFLINE_PRODUCTION_SEC / 100);
            await schedule(() => {
               for (let i = 0; i < batchSize; i++) {
                  tickEverySecond(gameState, true);
               }
            });
            await showOfflineProductionProgress(1 - timeLeft / offlineTime, routeTo);
            timeLeft -= batchSize;
         }
         const petraOfflineTime = actualOfflineTime - offlineTime;
         if (petra) {
            const storage = getStorageFor(petra.xy, gameState);
            if (!petra.building.resources.Warp) {
               petra.building.resources.Warp = 0;
            }
            petra.building.resources.Warp += petraOfflineTime;
            petra.building.resources.Warp = clamp(petra.building.resources.Warp, 0, storage.total);
         }

         const after = structuredClone(gameState);
         hasOfflineProductionModal = true;
         showModal(<OfflineProductionModal before={before} after={after} time={offlineTime} />);
      }
   } catch (error) {
      playError();
      showToast(String(error));
   }

   if (!hasOfflineProductionModal && getGameOptions().greatPeopleChoices.length > 0) {
      showModal(<ManageRebornModal />);
   }

   // We tick first before loading scene, making sure city-specific overrides are applied!
   tickEverySecond(gameState, false);

   if (import.meta.env.DEV) {
      // createRoot(document.getElementById("debug-ui")!).render(<GreatPersonDebug />);
   }

   const params = new URLSearchParams(location.href.split("?")[1]);
   switch (params.get("scene")) {
      case "Tech": {
         Singleton().sceneManager.loadScene(TechTreeScene);
         break;
      }
      default: {
         Singleton().sceneManager.loadScene(WorldScene);
         break;
      }
   }

   notifyGameStateUpdate();
   Singleton().ticker.start();
   await checkSteamBranch();
   if (import.meta.env.DEV) {
      RunTests(gameState);
   }
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

function findSpecialBuildings(gameState: GameState): ISpecialBuildings {
   const buildings: Partial<Record<Building, ITileData>> = {};
   forEach(gameState.tiles, (_, tile) => {
      if (tile.building?.type === "Headquarter") {
         console.assert(
            buildings.Headquarter === undefined,
            "There should be only one Headquarter. One =",
            buildings.Headquarter,
            "Another = ",
            tile,
         );
         buildings.Headquarter = tile;
      }
      if (tile.building?.type === "Petra") {
         console.assert(
            buildings.Petra === undefined,
            "There should be only one Petra. One =",
            buildings.Petra,
            "Another = ",
            tile,
         );
         buildings.Petra = tile;
      }
   });
   console.assert(buildings.Headquarter, "Should find 1 Headquarter");
   return buildings as ISpecialBuildings;
}

function verifyTextures(textures: Textures, city: City) {
   forEach(Config.Building, (b, def) => {
      if (!getBuildingTexture(b, textures, city)) {
         console.warn(`Cannot find texture for building ${b}`);
      }
      if (!isNullOrUndefined(def.max) && isNullOrUndefined(def.special)) {
         console.warn(`Building ${b} has "max" defined but "special" undefined. Please define "special"!`);
      }
   });
   forEach(DepositResources, (k, v) => {
      if (!getTileTexture(k, textures)) {
         console.warn(`Cannot find texture for deposit ${k}`);
      }
   });
}
