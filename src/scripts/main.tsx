import * as Sentry from "@sentry/browser";
import type { Texture } from "pixi.js";
import { Application, Assets, BitmapFont, Spritesheet } from "pixi.js";
import { createRoot } from "react-dom/client";
import Chars from "../../shared/utilities/Chars.json";
import { TypedEvent } from "../../shared/utilities/TypedEvent";
import "../css/Main.css";
import CabinMedium from "../fonts/CabinMedium.ttf?url";
import CabinSketchBold from "../fonts/CabinSketchBold.ttf?url";
import MarcellusRegular from "../fonts/MarcellusRegular.ttf?url";
import TextureBuildingsDef from "../images/textures_buildings.json";
import TextureBuildings from "../images/textures_buildings.png";
import TextureFlagsDef from "../images/textures_flags.json";
import TextureFlags from "../images/textures_flags.png";
import TextureMiscDef from "../images/textures_misc.json";
import TextureMisc from "../images/textures_misc.png";
import TexturePeopleDef from "../images/textures_people.json";
import TexturePeople from "../images/textures_people.png";
import TextureRomeDef from "../images/textures_rome.json";
import TextureRome from "../images/textures_rome.png";
import TextureTilesDef from "../images/textures_tiles.json";
import TextureTiles from "../images/textures_tiles.png";
import { startGame } from "./Bootstrap";
import { BG_COLOR } from "./Colors";
import type { RouteChangeEvent } from "./Route";
import { Route } from "./Route";
import { build } from "./Version.json";
import { ChatPanel } from "./ui/ChatPanel";
import { GlobalModal, GlobalToast } from "./ui/GlobalModal";
import { ResourcePanel } from "./ui/ResourcePanel";
import { FallbackFont, Fonts } from "./visuals/Fonts";

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
      Sentry.captureMessage(args.map((a) => JSON.stringify(a)).join(" "), "warning");
   };

   console.error = (...args) => {
      consoleError.apply(this, args);
      Sentry.captureMessage(args.map((a) => JSON.stringify(a)).join(" "), "error");
   };

   console.log = () => {};
}

const routeChanged = new TypedEvent<RouteChangeEvent>();
createRoot(document.getElementById("game-ui")!).render(<Route event={routeChanged} />);
createRoot(document.getElementById("chat-panel")!).render(<ChatPanel />);
createRoot(document.getElementById("resource-panel")!).render(<ResourcePanel />);
createRoot(document.getElementById("global-modal")!).render(<GlobalModal />);
createRoot(document.getElementById("global-toast")!).render(<GlobalToast />);

const canvas = document.getElementById("game-canvas");
const mainBundle = {
   TextureBuildings,
   TexturePeople,
   TextureRome,
   TextureTiles,
   TextureMisc,
   TextureFlags,
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

export async function loadBundle() {
   fonts.forEach((f) => document.fonts.add(f));
   const result = await Promise.all([Assets.loadBundle(["main"])].concat(fonts.map((f) => f.load())));
   const { main }: { main: MainBundleAssets } = result[0];

   fonts.forEach((f) =>
      BitmapFont.from(
         f.family,
         { fill: "#ffffff", fontSize: 64, fontFamily: f.family },
         { chars: BitmapFont.ASCII, resolution: 2 },
      ),
   );

   BitmapFont.from(
      FallbackFont,
      { fill: "#ffffff", fontSize: 64, fontFamily: "serif" },
      {
         chars: Chars.join(""),
         resolution: 2,
      },
   );

   const textures: Record<string, Texture> = {};

   const altas = await Promise.all([
      new Spritesheet(main.TextureBuildings, TextureBuildingsDef as any).parse(),
      new Spritesheet(main.TexturePeople, TexturePeopleDef as any).parse(),
      new Spritesheet(main.TextureRome, TextureRomeDef as any).parse(),
      new Spritesheet(main.TextureTiles, TextureTilesDef as any).parse(),
      new Spritesheet(main.TextureMisc, TextureMiscDef as any).parse(),
      new Spritesheet(main.TextureFlags, TextureFlagsDef as any).parse(),
   ]);

   altas.forEach((a) => {
      for (const k in a) {
         if (textures[k]) {
            console.warn(`Duplicated key in textures: ${k}`);
         } else {
            textures[k] = a[k];
         }
      }
   });

   return { main, textures };
}

function registerPixiInspector(app: Application) {
   (globalThis as any).__PIXI_APP__ = app;
}
