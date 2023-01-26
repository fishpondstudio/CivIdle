import { Viewport } from "pixi-viewport";
import { InteractionEvent, Sprite } from "pixi.js";
import { ROMAN_MAP_BG_COLOR } from "../Colors";
import { Unlockable } from "../definitions/CityDefinitions";
import { IProvinceVisual, RomeProvince } from "../definitions/RomeProvinceDefinitions";
import { Singleton } from "../Global";
import { TechPage } from "../ui/TechPage";
import { forEach } from "../utilities/Helper";
import { Scene } from "../utilities/SceneManager";
import { ProvinceVisual } from "./ProvinceVisual";

const WIDTH = 3000;
const HEIGHT = 1743;

const UNKNOWN: Record<string, IProvinceVisual> = {
   RomeUnknown1: { x: 614, y: 72 },
   RomeUnknown2: { x: 1950, y: 872 },
   RomeUnknown3: { x: 1172, y: 1516 },
};

export class RomeProvinceScene extends Scene {
   private _viewport!: Viewport;
   private readonly _provinces: ProvinceVisual[] = [];
   private _selectedProvince: ProvinceVisual | null = null;

   override async onLoad(): Promise<void> {
      const { app, textures, gameState } = this.context;
      this._viewport = new Viewport({
         interaction: app.renderer.plugins.interaction,
         disableOnContextMenu: true,
         screenWidth: app.screen.width,
         screenHeight: app.screen.height,
         worldWidth: WIDTH,
         worldHeight: HEIGHT,
      });
      this._viewport
         .drag()
         .wheel({ smooth: 10 })
         .clamp({
            direction: "all",
         })
         .clampZoom({
            maxScale: 1,
            minScale: Math.max(app.screen.width / WIDTH, app.screen.height / HEIGHT),
         })
         .setZoom(0);

      app.stage.addChild(this._viewport);
      app.renderer.backgroundColor = ROMAN_MAP_BG_COLOR;
      app.renderer.plugins.interaction.moveWhenInside = true;

      forEach(UNKNOWN, (name, config) => {
         const sprite = this._viewport.addChild(new Sprite(textures[name]));
         sprite.anchor.set(0.5, 0.5);
         sprite.tint = 0xcccccc;
         sprite.position.set(config.x, config.y);
      });

      this._viewport.sortableChildren = true;

      this._viewport.on("pointerdown", (e: InteractionEvent) => {
         this._selectedProvince = null;
         this._provinces.forEach((s) => {
            if (s.isClicked(e) && this._selectedProvince === null) {
               this._selectedProvince = s;
               s.outline = true;
               Singleton().routeTo(TechPage, { id: s.province, type: "RomeProvince" as const });
            } else {
               s.outline = false;
            }
         });
      });

      ProvinceVisual.i = 0;
      forEach(Unlockable.RomeProvince.definitions, (name) => {
         const province = new ProvinceVisual(name, textures[`Rome${name}`], app.renderer.plugins);
         if (gameState.unlocked[name]) {
            province.annex();
         }
         this._provinces.push(province);
         this._viewport.addChild(province);
      });

      this.selectProvince("Italia");
   }

   public selectProvince(id: RomeProvince): ProvinceVisual | null {
      this._selectedProvince = null;
      this._provinces.forEach((s) => {
         if (s.province === id && this._selectedProvince === null) {
            this._selectedProvince = s;
            s.outline = true;
            Singleton().routeTo(TechPage, { id: s.province, type: "RomeProvince" as const });
         } else {
            s.outline = false;
         }
      });
      return this._selectedProvince;
   }
}
