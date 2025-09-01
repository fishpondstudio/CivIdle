import { SmoothGraphics } from "@pixi/graphics-smooth";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { Container, type ColorSource, type FederatedPointerEvent } from "pixi.js";
import { feature, mesh } from "topojson-client";
import WorldStates from "../../images/countries-110m.json";
import { WonderPage } from "../ui/WonderPage";
import { Scene, type ISceneContext } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";

export class ConquestScene extends Scene {
   private _mapContainer: Container<SmoothGraphics>;

   constructor(context: ISceneContext) {
      super(context);
      const { app } = context;

      this._mapContainer = this.viewport.addChild(new Container<SmoothGraphics>());
      this.buildWorldMap();

      this.viewport.setWorldSize(this._mapContainer.width, this._mapContainer.height);
      this.viewport.zoom = Math.max(
         app.screen.width / this._mapContainer.width,
         app.screen.height / this._mapContainer.height,
      );
      this.viewport.setZoomRange(this.viewport.zoom * 0.5, this.viewport.zoom * 10);

      Singleton().routeTo(WonderPage, {});
   }

   buildWorldMap(): void {
      let graphics: SmoothGraphics;

      const path = geoPath()
         .projection(geoNaturalEarth1())
         .context({
            beginPath: () => {
               console.error("`beginPath` command is not supported");
            },
            moveTo: (x: number, y: number) => {
               graphics.moveTo(x, y);
            },
            lineTo: (x: number, y: number) => {
               graphics.lineTo(x, y);
            },
            closePath: () => {
               graphics.closePath();
            },
            arc: (
               x: number,
               y: number,
               radius: number,
               startAngle: number,
               endAngle: number,
               antiClockwise: boolean,
            ) => {
               graphics.arc(x, y, radius, startAngle, endAngle, antiClockwise);
            },
         });

      const countries = feature(WorldStates as any, WorldStates.objects.countries as any) as any;
      countries.features.forEach((feature: any) => {
         graphics = this._mapContainer.addChild(new SmoothGraphics());
         graphics.beginFill(0xffffff);
         path(feature.geometry as any);
         console.log(feature);
         // const centroid = path.centroid(feature.geometry as any);
         // const bounds = path.bounds(feature.geometry as any);
         // const width = bounds[1][0] - bounds[0][0];
         // const height = bounds[1][1] - bounds[0][1];
         // const text = this.viewport.addChild(
         //    new UnicodeText(
         //       feature.properties.name,
         //       {
         //          fontName: Fonts.Platypi,
         //          fontSize: 6,
         //          tint: 0x0000ff,
         //       },
         //       {
         //          fontFamily: "serif",
         //          fontSize: 6,
         //          fill: 0x0000ff,
         //       },
         //    ),
         // );
         // text.position.set(centroid[0], centroid[1]);
         // text.anchor.set(0.5, 0.5);
         // while (text.width > width * 0.75 || text.height > height * 0.75) {
         //    text.size /= 2;
         // }
         graphics.endFill();
      });

      graphics = this.viewport.addChild(new SmoothGraphics());
      graphics.lineStyle({
         color: 0xcccccc,
         width: 0.25,
         alignment: 0.5,
      });
      const borders = mesh(WorldStates as any, WorldStates.objects.countries as any, (a, b) => a !== b);
      path(borders);
   }

   override onClicked(e: FederatedPointerEvent): void {
      const pos = this.viewport.screenToWorld(e);
      const global = this.viewport.toGlobal(pos);
      this._mapContainer.children.forEach((child) => {
         const country = child as SmoothGraphics;
         if (!country.getBounds().contains(global.x, global.y)) {
            country.tint = 0xffffff;
            return;
         }
         if (!country.containsPoint(global)) {
            country.tint = 0xffffff;
            return;
         }
         country.tint = 0xff0000;
      });
   }

   override backgroundColor(): ColorSource {
      return 0x333333;
   }
}
