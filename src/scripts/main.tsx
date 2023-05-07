import { Assets } from "@pixi/assets";
import { Application, BitmapFont, Spritesheet } from "pixi.js";
import { createRoot } from "react-dom/client";
import "../css/Main.css";
import CabinMedium from "../fonts/CabinMedium.ttf?url";
import MarcellusRegular from "../fonts/MarcellusRegular.ttf?url";
import altasDef from "../images/textures.json";
import atlas from "../images/textures.png";
import { BG_COLOR } from "./Colors";
import { Building } from "./definitions/BuildingDefinitions";
import { City } from "./definitions/CityDefinitions";
import {
   GameStateChanged,
   getGameState,
   initializeSavedGame,
   initializeSingletons,
   ISingleton,
   loadGame,
   Singleton,
   SpecialBuildings as ISpecialBuildings,
   syncUITheme,
} from "./Global";
import { getBuildingTexture } from "./logic/BuildingLogic";
import { calculateTierAndPrice, Config } from "./logic/Constants";
import { initializeGameState } from "./logic/GameState";
import { ITileData } from "./logic/Tile";
import { tickEveryFrame, tickEverySecond } from "./logic/Update";
import { Route, RouteChangeEvent } from "./Route";
import { connectWebSocket, initSteamClient } from "./rpc/RPCClient";
import { Grid } from "./scenes/Grid";
import { WorldScene } from "./scenes/WorldScene";
import { ChatPanel } from "./ui/ChatPanel";
import { GlobalModal, GlobalToast } from "./ui/GlobalModal";
import { forEach } from "./utilities/Helper";
import Actions from "./utilities/pixi-actions/Actions";
import { SceneManager, Textures } from "./utilities/SceneManager";
import { TypedEvent } from "./utilities/TypedEvent";
import { Fonts } from "./visuals/Fonts";

const routeChanged = new TypedEvent<RouteChangeEvent>();

createRoot(document.getElementById("game-ui")!).render(<Route event={routeChanged} />);
createRoot(document.getElementById("chat-panel")!).render(<ChatPanel />);
createRoot(document.getElementById("global-modal")!).render(<GlobalModal />);
createRoot(document.getElementById("global-toast")!).render(<GlobalToast />);

const canvas = document.getElementById("game-canvas");
const mainBundle = {
   atlas,
};
const fonts = [
   new FontFace(Fonts.Cabin, `url(${CabinMedium})`),
   new FontFace(Fonts.Marcellus, `url(${MarcellusRegular})`),
];

export type MainBundle = keyof typeof mainBundle;
export type MainBundleAssets = Record<MainBundle, any>;

if (canvas) {
   const app = new Application({
      resizeTo: canvas,
      backgroundColor: BG_COLOR,
   });
   canvas.appendChild(app.view);
   registerPixiInspector(app);
   Assets.addBundle("main", mainBundle);
   loadBundle(app);
} else {
   console.error("Cannot find #game-canvas, check your HTML setup!");
}

async function loadBundle(app: Application) {
   fonts.forEach((f) => document.fonts.add(f));
   const result = await Promise.all([Assets.loadBundle(["main"])].concat(fonts.map((f) => f.load())));
   const { main }: { main: MainBundleAssets } = result[0];

   fonts.forEach((f) =>
      BitmapFont.from(
         f.family,
         { fill: "#ffffff", fontSize: 64, fontFamily: f.family },
         { chars: BitmapFont.ASCII, resolution: 2 }
      )
   );
   BitmapFont.from(
      Fonts.Marcellus,
      { fill: "#ffffff", fontSize: 64, fontFamily: Fonts.Marcellus },
      { chars: BitmapFont.ASCII, padding: 16, resolution: 2 }
   );
   const textures = await new Spritesheet(main.atlas, altasDef as any).parse();
   if (textures) {
      startGame(app, main, textures).catch(console.error);
   }
}

async function startGame(app: Application, resources: MainBundleAssets, textures: Textures) {
   if (window.__STEAM_API_URL) {
      await initSteamClient(window.__STEAM_API_URL);
   }
   let isNewPlayer = false;
   const data = await loadGame();
   if (data) {
      initializeSavedGame(data);
   } else {
      isNewPlayer = true;
   }
   const gameState = getGameState();

   verifyBuildingTextures(textures, gameState.city);

   const size = Config.City[gameState.city].size;
   const grid = new Grid(size, size, 64);

   if (isNewPlayer) {
      initializeGameState(gameState, grid);
   }

   // GameState is initialized!

   syncUITheme();

   calculateTierAndPrice(gameState);
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

   const singletons: ISingleton = {
      sceneManager: new SceneManager({ app, assets: resources, textures, gameState }),
      buildings: buildings as ISpecialBuildings,
      grid,
      routeTo: (component, params) => routeChanged.emit({ component, params }),
   };

   initializeSingletons(singletons);
   await connectWebSocket();

   // Singleton is initialized

   // Singleton().sceneManager.loadScene(RomeScene);
   // Singleton().sceneManager.loadScene(RomeHistoryScene);
   Singleton().sceneManager.loadScene(WorldScene);
   // Singleton().sceneManager.loadScene(TechTreeScene);

   GameStateChanged.emit(getGameState());
   app.ticker.add((frame) => {
      if (document.visibilityState !== "visible") {
         return;
      }
      Actions.tick(frame / app.ticker.FPS);
      tickEveryFrame(gameState, app.ticker.elapsedMS / 1000);
   });
   setInterval(tickEverySecond.bind(null, gameState), 1000);
}

function verifyBuildingTextures(textures: Textures, city: City) {
   forEach(Config.Building, (b) => {
      if (!getBuildingTexture(b, textures, city)) {
         console.warn(`Cannot find textures for building ${b}`);
      }
   });
}

function registerPixiInspector(app: Application) {
   // @ts-expect-error
   globalThis.__PIXI_APP__ = app;
}
