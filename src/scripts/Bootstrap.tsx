import { Application, Ticker } from "pixi.js";
import { Building } from "./definitions/BuildingDefinitions";
import { City } from "./definitions/CityDefinitions";
import {
   getGameOptions,
   getGameState,
   isGameDataCompatible,
   loadGame,
   notifyGameStateUpdate,
   syncUITheme,
} from "./Global";
import { getBuildingTexture } from "./logic/BuildingLogic";
import { calculateTierAndPrice, Config } from "./logic/Constants";
import { GameState, initializeGameState } from "./logic/GameState";
import { ITileData } from "./logic/Tile";
import { shouldTick, tickEveryFrame, tickEverySecond } from "./logic/Update";
import { MainBundleAssets } from "./main";
import { RouteChangeEvent } from "./Route";
import { connectWebSocket } from "./rpc/RPCClient";
import { Grid } from "./scenes/Grid";
import { WorldScene } from "./scenes/WorldScene";
import { checkSteamBranch } from "./SteamTesting";
import { showModal, showToast } from "./ui/GlobalModal";
import { OfflineProductionModal } from "./ui/OfflineProductionModal";
import { forEach, isNullOrUndefined, rejectIn } from "./utilities/Helper";
import Actions from "./utilities/pixi-actions/Actions";
import { SceneManager, Textures } from "./utilities/SceneManager";
import { initializeSingletons, ISpecialBuildings, RouteTo, Singleton } from "./utilities/Singleton";
import { TypedEvent } from "./utilities/TypedEvent";
import { playError } from "./visuals/Sound";

export async function startGame(
   app: Application,
   resources: MainBundleAssets,
   textures: Textures,
   routeChanged: TypedEvent<RouteChangeEvent>
) {
   const routeTo: RouteTo = (component, params) => routeChanged.emit({ component, params });

   // ========== Load game data ==========
   let isNewPlayer = false;
   const data = await loadGame();
   if (data && (await isGameDataCompatible(data, routeTo))) {
      // Nothing to do yet
   } else {
      isNewPlayer = true;
   }

   // ========== Game data is loaded ==========

   const gameState = getGameState();

   verifyBuildingConfig(textures, gameState.city);

   const size = Config.City[gameState.city].size;
   const grid = new Grid(size, size, 64);

   if (isNewPlayer) {
      initializeGameState(gameState, grid);
   }

   // ========== Game state is initialized ==========

   syncUITheme(getGameOptions());
   calculateTierAndPrice(gameState);
   initializeSingletons({
      sceneManager: new SceneManager({ app, assets: resources, textures, gameState }),
      buildings: findSpecialBuildings(gameState) as ISpecialBuildings,
      grid,
      routeTo,
   });

   // ========== Connect to server ==========
   try {
      const offlineTime = await Promise.race([connectWebSocket(), rejectIn<number>(5, "Connection Timeout")]);
      if (offlineTime >= 60) {
         const before = JSON.parse(JSON.stringify(gameState));
         for (let i = 0; i < offlineTime; i++) {
            tickEverySecond(gameState);
         }
         const after = JSON.parse(JSON.stringify(gameState));
         showModal(<OfflineProductionModal before={before} after={after} time={offlineTime} />);
      }
   } catch (error) {
      playError();
      showToast(String(error));
   }

   // We tick first before loading scene, making sure city-specific overrides are applied!
   tickEverySecond(gameState);

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

function startTicker(ticker: Ticker, gameState: GameState) {
   ticker.add(() => {
      if (!shouldTick()) {
         return;
      }
      const dt = ticker.elapsedMS / 1000;
      Actions.tick(dt);
      tickEveryFrame(gameState, dt);
   });

   setInterval(tickEverySecond.bind(null, gameState), 1000);
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
