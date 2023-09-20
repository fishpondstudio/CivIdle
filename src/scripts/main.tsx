import * as Sentry from "@sentry/browser";
import { Application, Assets } from "pixi.js";
import { createRoot } from "react-dom/client";
import "../css/Main.css";
import CabinMedium from "../fonts/CabinMedium.ttf?url";
import CabinSketchBold from "../fonts/CabinSketchBold.ttf?url";
import MarcellusRegular from "../fonts/MarcellusRegular.ttf?url";
import atlas from "../images/textures.png";
import { loadBundle, startGame } from "./Bootstrap";
import { BG_COLOR } from "./Colors";
import { Route, RouteChangeEvent } from "./Route";
import { ChatPanel } from "./ui/ChatPanel";
import { GlobalModal, GlobalToast } from "./ui/GlobalModal";
import { TypedEvent } from "./utilities/TypedEvent";
import { build } from "./Version.json";
import { Fonts } from "./visuals/Fonts";

if (!import.meta.env.DEV) {
   Sentry.init({
      dsn: "https://dc918a4ab59f404688ab61ea803de8c0@bugreport.fishpondstudio.com/1",
      release: `Build.${build}`,
      autoSessionTracking: false,
   });

   const consoleWarn = console.warn;
   const consoleError = console.error;

   console.warn = (...args) => {
      consoleWarn.apply(this, args);
      Sentry.captureMessage(JSON.stringify(args));
   };

   console.error = (...args) => {
      consoleError.apply(this, args);
      Sentry.captureMessage(JSON.stringify(args));
   };

   console.log = () => {};
}

const routeChanged = new TypedEvent<RouteChangeEvent>();
createRoot(document.getElementById("game-ui")!).render(<Route event={routeChanged} />);
createRoot(document.getElementById("chat-panel")!).render(<ChatPanel />);
createRoot(document.getElementById("global-modal")!).render(<GlobalModal />);
createRoot(document.getElementById("global-toast")!).render(<GlobalToast />);

const canvas = document.getElementById("game-canvas");
const mainBundle = {
   atlas,
};
export const fonts = [
   new FontFace(Fonts.Cabin, `url("${CabinMedium}")`),
   new FontFace(Fonts.Marcellus, `url("${MarcellusRegular}")`),
   new FontFace(Fonts.CabinSketch, `url("${CabinSketchBold}")`),
];

export type MainBundle = keyof typeof mainBundle;
export type MainBundleAssets = Record<MainBundle, any>;

if (canvas) {
   const app = new Application({
      resizeTo: canvas,
      backgroundColor: BG_COLOR,
      sharedTicker: true,
   });
   canvas.appendChild(app.view as any);
   registerPixiInspector(app);
   Assets.addBundle("main", mainBundle);
   loadBundle()
      .then(({ main, textures }) => {
         return startGame(app, main, textures, routeChanged);
      })
      .catch(console.error);
} else {
   console.error("Cannot find #game-canvas, check your HTML setup!");
}

function registerPixiInspector(app: Application) {
   (globalThis as any).__PIXI_APP__ = app;
}
