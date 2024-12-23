import * as Sentry from "@sentry/browser";
import type { Texture } from "pixi.js";
import { Application, Assets, BitmapFont, Spritesheet } from "pixi.js";
import { createRoot } from "react-dom/client";
import { TypedEvent } from "../../shared/utilities/TypedEvent";
import "../css/Main.css";
import CabinMedium from "../fonts/CabinMedium.ttf?url";
import OldTypefaces from "../fonts/OldTypefaces.ttf";
import Platypi from "../fonts/Platypi-Medium.ttf";
import TextureBuildingDef from "../images/textures_building.json";
import TextureBuilding from "../images/textures_building.png";
import TextureFlagDef from "../images/textures_flag.json";
import TextureFlag from "../images/textures_flag.png";
import TextureMiscDef from "../images/textures_misc.json";
import TextureMisc from "../images/textures_misc.png";
import TexturePersonDef from "../images/textures_person.json";
import TexturePerson from "../images/textures_person.png";
import TextureRomeDef from "../images/textures_rome.json";
import TextureRome from "../images/textures_rome.png";
import TextureTileDef from "../images/textures_tile.json";
import TextureTile from "../images/textures_tile.png";
import { startGame } from "./Bootstrap";
import { BG_COLOR } from "./Colors";
import type { RouteChangeEvent } from "./Route";
import { Route } from "./Route";
import { build } from "./Version.json";
import { ChatPanel } from "./ui/ChatPanel";
import { GlobalModal, GlobalToast } from "./ui/GlobalModal";
import { ResourcePanel } from "./ui/ResourcePanel";
import { Fonts } from "./visuals/Fonts";

if (!import.meta.env.DEV) {
   Sentry.init({
      dsn: "https://dc918a4ab59f404688ab61ea803de8c0@bugreport.fishpondstudio.com/1",
      release: `Build.${build}`,
      autoSessionTracking: false,
      integrations: [Sentry.captureConsoleIntegration({ levels: ["warn", "error", "assert"] })],
   });
}

const routeChanged = new TypedEvent<RouteChangeEvent>();
createRoot(document.getElementById("game-ui")!).render(<Route event={routeChanged} />);
createRoot(document.getElementById("chat-panel")!).render(<ChatPanel />);
createRoot(document.getElementById("resource-panel")!).render(<ResourcePanel />);
createRoot(document.getElementById("global-modal")!).render(<GlobalModal />);
createRoot(document.getElementById("global-toast")!).render(<GlobalToast />);

const canvas = document.getElementById("game-canvas");
const mainBundle = {
   TextureBuilding,
   TexturePerson,
   TextureRome,
   TextureTile,
   TextureMisc,
   TextureFlag,
};
export const fonts = [
   new FontFace(Fonts.Cabin, `url("${CabinMedium}")`),
   new FontFace(Fonts.Platypi, `url("${Platypi}")`),
   new FontFace(Fonts.OldTypefaces, `url("${OldTypefaces}")`),
];

export type MainBundle = keyof typeof mainBundle;
export type MainBundleAssets = Record<MainBundle, any>;

if (canvas) {
   const app = new Application({
      resizeTo: canvas,
      backgroundColor: BG_COLOR,
      sharedTicker: true,
      autoDensity: true,
      resolution: window.devicePixelRatio,
   });

   canvas.appendChild(app.view as any);
   if (import.meta.env.DEV) {
      registerPixiInspector(app);
      document.body.style.userSelect = "auto";
   }
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
   console.time("Load Default Font");
   fonts.forEach((f) => document.fonts.add(f));
   const result = await Promise.all([Assets.loadBundle(["main"])].concat(fonts.map((f) => f.load())));
   const { main }: { main: MainBundleAssets } = result[0];

   fonts.forEach((f) =>
      BitmapFont.from(
         f.family,
         Object.assign(
            {
               fill: "#ffffff",
               fontSize: 64,
               fontFamily: f.family,
            },
            f.family === Fonts.Cabin
               ? {
                    dropShadow: true,
                    dropShadowAlpha: 0.75,
                    dropShadowColor: "#000000",
                    dropShadowAngle: Math.PI / 6,
                    dropShadowBlur: 0,
                    dropShadowDistance: 3,
                 }
               : {},
         ),
         { chars: BitmapFont.ASCII, resolution: 2, padding: 8 },
      ),
   );
   console.timeEnd("Load Default Font");

   console.time("Load Sprite sheets");
   const textures: Record<string, Texture> = {};
   const altas = await Promise.all([
      new Spritesheet(main.TextureBuilding, TextureBuildingDef as any).parse(),
      new Spritesheet(main.TexturePerson, TexturePersonDef as any).parse(),
      new Spritesheet(main.TextureRome, TextureRomeDef as any).parse(),
      new Spritesheet(main.TextureTile, TextureTileDef as any).parse(),
      new Spritesheet(main.TextureMisc, TextureMiscDef as any).parse(),
      new Spritesheet(main.TextureFlag, TextureFlagDef as any).parse(),
   ]);

   altas.forEach((a) => {
      for (const k in a) {
         if (textures[k]) {
            console.warn(`Duplicated key in textures: ${k}`);
         } else {
            textures[k] = a[k];
         }
         // if (k.startsWith("Person") && !(k.substring(6) in Config.GreatPerson)) {
         //    console.warn("Unused Great Person", k);
         // }
      }
   });
   console.timeEnd("Load Sprite sheets");

   return { main, textures };
}

function registerPixiInspector(app: Application) {
   (globalThis as any).__PIXI_APP__ = app;
}
