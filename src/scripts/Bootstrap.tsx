import type { Application, Texture } from "pixi.js";
import type { City } from "../../shared/definitions/CityDefinitions";
import { IsDeposit } from "../../shared/definitions/ResourceDefinitions";
import { TimedBuildingUnlock } from "../../shared/definitions/TimedBuildingUnlock";
import { addPetraOfflineTime, findSpecialBuilding } from "../../shared/logic/BuildingLogic";
import { Config } from "../../shared/logic/Config";
import { MAX_OFFLINE_PRODUCTION_SEC, calculateTierAndPrice } from "../../shared/logic/Constants";
import { Languages, syncLanguage, type GameState } from "../../shared/logic/GameState";
import {
   getGameOptions,
   getGameState,
   notifyGameStateUpdate,
   serializeSaveLite,
} from "../../shared/logic/GameStateLogic";
import { initializeGameState } from "../../shared/logic/InitializeGameState";
import type { IWelcomeMessage } from "../../shared/utilities/Database";
import { isSaveOwner } from "../../shared/utilities/DatabaseShared";
import {
   clamp,
   deepFreeze,
   forEach,
   isNullOrUndefined,
   rejectIn,
   safeAdd,
   safePush,
   schedule,
} from "../../shared/utilities/Helper";
import { getServerNow } from "../../shared/utilities/ServerNow";
import type { TypedEvent } from "../../shared/utilities/TypedEvent";
import { isGameDataCompatible, loadGame, syncFontSizeScale, syncSidePanelWidth, syncUITheme } from "./Global";
import type { RouteChangeEvent } from "./Route";
import { tickEverySecond } from "./logic/ClientUpdate";
import { Heartbeat } from "./logic/Heartbeat";
import { getFullVersion } from "./logic/Version";
import { getBuildingTexture, getTileTexture } from "./logic/VisualLogic";
import type { MainBundleAssets } from "./main";
import { connectWebSocket } from "./rpc/RPCClient";
import { PlayerMapScene } from "./scenes/PlayerMapScene";
import { TechTreeScene } from "./scenes/TechTreeScene";
import { WorldScene } from "./scenes/WorldScene";
import { ChooseGreatPersonModal } from "./ui/ChooseGreatPersonModal";
import { CrossPlatformSavePage } from "./ui/CrossPlatformSavePage";
import { ErrorPage } from "./ui/ErrorPage";
import { FirstTimePlayerModal } from "./ui/FirstTimePlayerModal";
import { showModal, showToast } from "./ui/GlobalModal";
import { LoadingPage, LoadingPageStage } from "./ui/LoadingPage";
import { OfflineProductionModal } from "./ui/OfflineProductionModal";
import { SaveCorruptedPage } from "./ui/SaveCorruptedPage";
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
   console.log("CivIdle version:", getFullVersion());
   // ========== Load game data ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.LoadSave });

   let isNewPlayer = false;
   const data = await loadGame();
   if (data) {
      if (!findSpecialBuilding("Headquarter", data.current)) {
         playError();
         routeTo(SaveCorruptedPage, {});
         return;
      }
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
   if (isNewPlayer) {
      initializeGameState(gameState, options);
   }
   verifyTextures(textures, gameState.city);

   // ========== Game state is initialized ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.CheckSave });
   syncLanguage(Languages[options.language]);
   syncUITheme(options);
   syncSidePanelWidth(app, options);
   syncFontSizeScale(app, options);
   calculateTierAndPrice(import.meta.env.DEV ? console.log : undefined);
   const context = { app, assets: resources, textures, gameState };
   initializeSingletons({
      sceneManager: new SceneManager(context),
      routeTo,
      ticker: new GameTicker(app.ticker, gameState),
      heartbeat: new Heartbeat(serializeSaveLite()),
   });
   setCityOverride(gameState);

   // ========== Connect to server ==========
   routeTo(LoadingPage, { stage: LoadingPageStage.SteamSignIn });
   const TIMEOUT = import.meta.env.DEV ? 1 : 30;
   let hasOfflineProductionModal = false;

   try {
      const welcome = await Promise.race([
         connectWebSocket(),
         rejectIn<IWelcomeMessage>(TIMEOUT, "Connection Timeout"),
      ]);

      if (!isSaveOwner(welcome.platformInfo, welcome.user)) {
         routeTo(CrossPlatformSavePage, {});
         return;
      }

      const actualOfflineTime = welcome.offlineTime;

      const maxOfflineTime = (options.offlineProductionPercent ?? 0) * MAX_OFFLINE_PRODUCTION_SEC;
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
         addPetraOfflineTime(petraOfflineTime, gameState);
         const after = structuredClone(gameState);
         hasOfflineProductionModal = true;
         showModal(<OfflineProductionModal before={before} after={after} time={offlineTime} />);
      }
   } catch (error) {
      console.error(error);
      playError();
      showToast(String(error));
   }

   setTimedOverride(gameState);

   if (hasOfflineProductionModal) {
      // Do nothing
   } else if (isNewPlayer) {
      showModal(<FirstTimePlayerModal />);
   } else if (options.greatPeopleChoicesV2.length > 0) {
      showModal(<ChooseGreatPersonModal permanent={true} />);
   }

   Singleton().heartbeat.init();

   // We tick first before loading scene, making sure city-specific overrides are applied!
   tickEverySecond(gameState, false);

   if (import.meta.env.DEV) {
      // showModal(<AccountRankUpModal rank={AccountLevel.Praetor} />);
      // createRoot(document.getElementById("debug-ui")!).render(<DebugPage />);
   }

   const params = new URLSearchParams(location.href.split("?")[1]);

   switch (params.get("scene")) {
      case "Save": {
         routeTo(CrossPlatformSavePage, {});
         break;
      }
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

// This method is called after server time is synced!
export function setTimedOverride(gs: GameState): void {
   const now = getServerNow();
   if (now === null) {
      return;
   }
   const nowDate = new Date(now);

   forEach(TimedBuildingUnlock, (building, def) => {
      if (def.condition(nowDate) || import.meta.env.DEV) {
         safePush(Config.Tech[def.tech], "unlockBuilding", building);
      }
   });
}

// This method is called early during bootstrap!
export function setCityOverride(gameState: GameState): void {
   const city = Config.City[gameState.city];
   forEach(city.buildingNames, (b, name) => {
      Config.Building[b].name = name;
   });
   deepFreeze(Config.Building);

   forEach(city.uniqueBuildings, (building, tech) => {
      if (!Config.Tech[tech].unlockBuilding) {
         Config.Tech[tech].unlockBuilding = [];
      }
      Config.Tech[tech].unlockBuilding!.push(building);
   });

   forEach(city.uniqueMultipliers, (tech, multipliers) => {
      const def = Config.Tech[tech];
      if (multipliers.globalMultiplier) {
         if (def.globalMultiplier) {
            forEach(multipliers.globalMultiplier, (k, v) => {
               safeAdd(def.globalMultiplier!, k, v);
            });
         } else {
            def.globalMultiplier = structuredClone(multipliers.globalMultiplier);
         }
      }
      if (multipliers.buildingMultiplier) {
         forEach(multipliers.buildingMultiplier, (building, multipliers) => {
            if (!def.buildingMultiplier) {
               def.buildingMultiplier = {};
            }
            if (def.buildingMultiplier[building]) {
               forEach(multipliers, (kk, vv) => {
                  safeAdd(def.buildingMultiplier![building]!, kk, vv);
               });
            } else {
               def.buildingMultiplier[building] = structuredClone(multipliers);
            }
         });
      }
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
         console.warn(`Missing texture for building ${b}`);
      }
      if (!isNullOrUndefined(def.max) && isNullOrUndefined(def.special)) {
         console.warn(`Building ${b} has "max" defined but "special" undefined. Please define "special"!`);
      }
   });
   forEach(IsDeposit, (k, v) => {
      if (!getTileTexture(k, textures)) {
         console.warn(`Missing texture for deposit ${k}`);
      }
   });
   forEach(Config.GreatPerson, (p, def) => {
      if (!textures[`Person_${p}`]) {
         console.warn(`Missing texture for great person: ${p}`);
      }
   });
}
