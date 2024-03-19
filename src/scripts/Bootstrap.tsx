import type { Application, Texture } from "pixi.js";
import { type City } from "../../shared/definitions/CityDefinitions";
import { IsDeposit } from "../../shared/definitions/ResourceDefinitions";
import { getStorageFor } from "../../shared/logic/BuildingLogic";
import { Config } from "../../shared/logic/Config";
import { MAX_OFFLINE_PRODUCTION_SEC, calculateTierAndPrice } from "../../shared/logic/Constants";
import { Languages, syncLanguage, type GameState } from "../../shared/logic/GameState";
import {
   getGameOptions,
   getGameState,
   notifyGameStateUpdate,
   serializeSave,
} from "../../shared/logic/GameStateLogic";
import { initializeGameState } from "../../shared/logic/InitializeGameState";
import { getSpecialBuildings } from "../../shared/logic/IntraTickCache";
import type { IPetraBuildingData } from "../../shared/logic/Tile";
import { clamp, forEach, isNullOrUndefined, rejectIn, schedule } from "../../shared/utilities/Helper";
import type { TypedEvent } from "../../shared/utilities/TypedEvent";
import { isGameDataCompatible, loadGame, syncFontSizeScale, syncSidePanelWidth, syncUITheme } from "./Global";
import type { RouteChangeEvent } from "./Route";
import { tickEverySecond } from "./logic/ClientUpdate";
import { Heartbeat } from "./logic/Heartbeat";
import { getBuildingTexture, getTileTexture } from "./logic/VisualLogic";
import type { MainBundleAssets } from "./main";
import { connectWebSocket } from "./rpc/RPCClient";
import { PlayerMapScene } from "./scenes/PlayerMapScene";
import { TechTreeScene } from "./scenes/TechTreeScene";
import { WorldScene } from "./scenes/WorldScene";
import { ChooseGreatPersonModal } from "./ui/ChooseGreatPersonModal";
import { ErrorPage } from "./ui/ErrorPage";
import { FirstTimePlayerModal } from "./ui/FirstTimePlayerModal";
import { showModal, showToast } from "./ui/GlobalModal";
import { LoadingPage, LoadingPageStage } from "./ui/LoadingPage";
import { OfflineProductionModal } from "./ui/OfflineProductionModal";
import { GameTicker } from "./utilities/GameTicker";
import { SceneManager } from "./utilities/SceneManager";
import { Singleton, initializeSingletons, type RouteTo } from "./utilities/Singleton";
import { playError } from "./visuals/Sound";

export async function startGame(
   app: Application,
   resources: MainBundleAssets,
   textures: Record<string, Texture>,
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
   const options = getGameOptions();
   verifyTextures(textures, gameState.city);
   if (isNewPlayer) {
      initializeGameState(gameState, options);
   }

   // ========== Game state is initialized ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.CheckSave });
   syncLanguage(Languages[options.language]);
   syncUITheme(options);
   syncSidePanelWidth(app, options);
   syncFontSizeScale(options);
   calculateTierAndPrice(console.log);
   initializeSingletons({
      sceneManager: new SceneManager({ app, assets: resources, textures, gameState }),
      routeTo,
      ticker: new GameTicker(app.ticker, gameState),
      heartbeat: new Heartbeat(serializeSave()),
   });

   setCityOverride(gameState);

   // ========== Connect to server ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.SteamSignIn });
   const TIMEOUT = import.meta.env.DEV ? 1 : 15;
   let hasOfflineProductionModal = false;
   try {
      const actualOfflineTime = await Promise.race([
         connectWebSocket(),
         rejectIn<number>(TIMEOUT, "Connection Timeout"),
      ]);

      const petra = getSpecialBuildings(gameState).Petra;
      const maxOfflineTime =
         ((petra?.building as IPetraBuildingData | undefined)?.offlineProductionPercent ?? 1) *
         MAX_OFFLINE_PRODUCTION_SEC;
      const offlineTime = clamp(actualOfflineTime, 0, maxOfflineTime);

      routeTo(LoadingPage, { stage: LoadingPageStage.OfflineProduction });
      if (actualOfflineTime >= 60) {
         const before = structuredClone(gameState);
         let timeLeft = offlineTime;
         while (timeLeft > 0) {
            const batchSize = Math.min(timeLeft, MAX_OFFLINE_PRODUCTION_SEC / 100);
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
            const storage = getStorageFor(petra.tile, gameState);
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

   if (hasOfflineProductionModal) {
      // Do nothing
   } else if (isNewPlayer) {
      showModal(<FirstTimePlayerModal />);
   } else if (options.greatPeopleChoices.length > 0) {
      showModal(<ChooseGreatPersonModal permanent={true} />);
   }

   Singleton().heartbeat.init();

   // We tick first before loading scene, making sure city-specific overrides are applied!
   tickEverySecond(gameState, false);

   if (import.meta.env.DEV) {
      // createRoot(document.getElementById("debug-ui")!).render(<DebugPage />);
   }

   const params = new URLSearchParams(location.href.split("?")[1]);
   switch (params.get("scene")) {
      case "Tech": {
         Singleton().sceneManager.loadScene(TechTreeScene);
         break;
      }
      case "Trade": {
         Singleton().sceneManager.loadScene(PlayerMapScene);
         break;
      }
      default: {
         Singleton().sceneManager.loadScene(WorldScene);
         break;
      }
   }
   notifyGameStateUpdate();
   Singleton().ticker.start();
}

// This method is called early during bootstrap!
export function setCityOverride(gameState: GameState) {
   const city = Config.City[gameState.city];
   forEach(city.buildingNames, (b, name) => {
      Config.Building[b].name = name;
   });
   forEach(city.uniqueBuildings, (building, tech) => {
      if (!Config.Tech[tech].unlockBuilding) {
         Config.Tech[tech].unlockBuilding = [];
      }
      Config.Tech[tech].unlockBuilding!.push(building);
   });
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

function verifyTextures(textures: Record<string, Texture>, city: City) {
   forEach(Config.Building, (b, def) => {
      if (!getBuildingTexture(b, textures, city)) {
         console.warn(`Cannot find texture for building ${b}`);
      }
      if (!isNullOrUndefined(def.max) && isNullOrUndefined(def.special)) {
         console.warn(`Building ${b} has "max" defined but "special" undefined. Please define "special"!`);
      }
   });
   forEach(IsDeposit, (k, v) => {
      if (!getTileTexture(k, textures)) {
         console.warn(`Cannot find texture for deposit ${k}`);
      }
   });
}
