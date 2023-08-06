import { FederatedPointerEvent, Sprite } from "pixi.js";
import { ROMAN_MAP_BG_COLOR } from "../Colors";
import { IProvinceVisual, RomeProvince } from "../definitions/RomeProvinceDefinitions";
import { forEach } from "../utilities/Helper";
import { ViewportScene } from "../utilities/SceneManager";
import { ProvinceVisual } from "./ProvinceVisual";

const WIDTH = 3000;
const HEIGHT = 1743;

const UNKNOWN: Record<string, IProvinceVisual> = {
   RomeUnknown1: { x: 614, y: 72 },
   RomeUnknown2: { x: 1950, y: 872 },
   RomeUnknown3: { x: 1172, y: 1516 },
};

export class RomeProvinceScene extends ViewportScene {
   private readonly _provinces: ProvinceVisual[] = [];
   private _selectedProvince: ProvinceVisual | null = null;

   override async onLoad(): Promise<void> {
      const { app, textures, gameState } = this.context;
      this.viewport.worldWidth = WIDTH;
      this.viewport.worldHeight = HEIGHT;
      this.viewport
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

      app.renderer.background.color = ROMAN_MAP_BG_COLOR;

      forEach(UNKNOWN, (name, config) => {
         const sprite = this.viewport.addChild(new Sprite(textures[name]));
         sprite.anchor.set(0.5, 0.5);
         sprite.tint = 0xcccccc;
         sprite.position.set(config.x, config.y);
      });

      this.viewport.sortableChildren = true;

      this.viewport.on("pointerdown", (e: FederatedPointerEvent) => {
         this._selectedProvince = null;
         this._provinces.forEach((s) => {
            if (s.isClicked(e) && this._selectedProvince === null) {
               this._selectedProvince = s;
               s.outline = true;
               // FIXME: Fix after province page refactor
               // Singleton().routeTo(TechPage, { id: s.province, type: "RomeProvince" as const });
            } else {
               s.outline = false;
            }
         });
      });

      ProvinceVisual.i = 0;
      forEach(RomeProvince, (name) => {
         const province = new ProvinceVisual(name, textures[`Rome${name}`], app.renderer.plugins);
         if (gameState.unlockedProvince[name]) {
            province.annex();
         }
         this._provinces.push(province);
         this.viewport.addChild(province);
      });

      this.selectProvince("Italia");
   }

   override onResize(width: number, height: number): void {
      this.viewport.resize(width, height);
   }

   public annexProvince(id: RomeProvince): void {
      this._provinces.forEach((s) => {
         if (s.province === id) {
            s.annex();
         }
      });
   }

   public selectProvince(id: RomeProvince): ProvinceVisual | null {
      this._selectedProvince = null;
      this._provinces.forEach((s) => {
         if (s.province === id && this._selectedProvince === null) {
            this._selectedProvince = s;
            s.outline = true;
            // FIXME: Fix after province page refactor
            // Singleton().routeTo(TechPage, { id: s.province, type: "RomeProvince" as const });
         } else {
            s.outline = false;
         }
      });
      return this._selectedProvince;
   }
}
