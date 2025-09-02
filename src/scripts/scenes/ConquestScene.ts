import { SmoothGraphics } from "@pixi/graphics-smooth";
import { geoMercator, geoPath } from "d3-geo";
import { Container, type ColorSource, type FederatedPointerEvent } from "pixi.js";
import { feature, mesh, neighbors } from "topojson-client";
import { UnicodeText } from "../../../shared/utilities/UnicodeText";
import World from "../../images/countries-50m.json";
import { ConquestPage } from "../ui/ConquestPage";
import { calculateArea, calculateBounds, calculateCentroid } from "../utilities/SVGGraphics/SVGPathParser";
import { Scene, type ISceneContext } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import { Fonts } from "../visuals/Fonts";

export const CountryMapping: { index: number; area: SmoothGraphics; text: UnicodeText }[] = [];

export class ConquestScene extends Scene {
   private _mapContainer: Container<SmoothGraphics>;
   private _countryBorders: SmoothGraphics;
   private _countryLabels: Container<UnicodeText>;

   constructor(context: ISceneContext) {
      super(context);
      const { app } = context;

      this._mapContainer = this.viewport.addChild(new Container<SmoothGraphics>());
      this._countryBorders = this.viewport.addChild(new SmoothGraphics());
      this._countryLabels = this.viewport.addChild(new Container<UnicodeText>());

      console.time("buildWorldMap");
      this.buildWorldMap();
      console.timeEnd("buildWorldMap");

      this._mapContainer.position.set(0, 0);

      this.viewport.setWorldSize(this._mapContainer.width, this._mapContainer.height);
      const minZoom = Math.max(
         app.screen.width / this._mapContainer.width,
         app.screen.height / this._mapContainer.height,
      );

      this.viewport.zoom = minZoom;
      this.viewport.setZoomRange(minZoom, this.viewport.zoom * 10);

      Singleton().routeTo(ConquestPage, {});
   }

   buildWorldMap(): void {
      let graphics: SmoothGraphics;

      const projection = geoMercator();
      const path = geoPath()
         .projection(projection)
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

      const countries = feature(World as any, World.objects.countries as any) as any;

      projection.fitExtent(
         [
            [0, 0],
            [1000, 1000],
         ],
         countries,
      );

      const labels: Record<string, { x: number; y: number; angle: number; size: number }> = JSON.parse(
         localStorage.getItem("CountryMapping") ?? "{}",
      );
      // const labels: Record<string, { x: number; y: number; angle: number; size: number }> = WorldLabel;
      countries.features.forEach((feature: any, index: number) => {
         graphics = this._mapContainer.addChild(new SmoothGraphics());
         graphics.beginFill(0xffffff);
         path(feature.geometry);
         graphics.endFill();
         graphics.tint = 0xffffff;

         let maxPoints: [number, number][] = [];
         let maxArea = 0;

         if (feature.geometry.type === "Polygon") {
            const projected = feature.geometry.coordinates.flatMap((points: [number, number][]) => {
               return points.map((point: [number, number]) => {
                  return projection(point)!;
               });
            });
            const area = calculateArea(projected);
            projected.forEach((point: [number, number]) => {
               if (point[0] < 0 || point[1] < 0) {
                  console.log(point);
               }
            });
            if (area > maxArea) {
               maxArea = area;
               maxPoints = projected;
            }
         }
         if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach((points: [number, number][][]) => {
               points.forEach((points: [number, number][]) => {
                  const projected = points.map((point: [number, number]) => {
                     return projection(point)!;
                  });
                  const area = calculateArea(projected);
                  if (area > maxArea) {
                     maxArea = area;
                     maxPoints = projected;
                  }
                  projected.forEach((point: [number, number]) => {
                     if (point[0] < 0 || point[1] < 0) {
                        console.log(point);
                     }
                  });
               });
            });
         }
         const cached = labels[feature.properties.name];
         if (cached) {
            const text = this._countryLabels.addChild(
               new UnicodeText(
                  feature.properties.name,
                  {
                     fontName: `${Fonts.Cabin}NoShadow`,
                     tint: 0x666666,
                  },
                  {
                     fontFamily: "'Inter Tight', serif",
                     fill: 0x666666,
                  },
               ),
            );
            text.anchor.set(0.5, 0.5);
            text.size = cached.size;
            text.x = cached.x;
            text.y = cached.y;
            text.angle = cached.angle;
            CountryMapping.push({ index, area: graphics, text });
         } else {
            const text = this._drawText(feature.properties.name, maxPoints);
            CountryMapping.push({ index, area: graphics, text });
         }
      });

      graphics = this._countryBorders;
      graphics.lineStyle({
         color: 0xcccccc,
         width: 0.2,
         alignment: 0.5,
      });
      const borders = mesh(World as any, World.objects.countries as any, (a, b) => a !== b);
      path(borders);
   }

   private _drawText(label: string, projected: [number, number][]): UnicodeText {
      const text = this._countryLabels.addChild(
         new UnicodeText(
            label,
            {
               fontName: `${Fonts.Cabin}NoShadow`,
               fontSize: 20,
               tint: 0x666666,
            },
            {
               fontFamily: "serif",
               fontSize: 20,
               fill: 0x666666,
            },
         ),
      );

      const centroid = calculateCentroid(projected);
      text.position.set(centroid[0], centroid[1]);
      text.anchor.set(0.5, 0.5);

      const [minX, minY, maxX, maxY] = calculateBounds(projected);
      while (text.size > 0 && (text.width * 2 > maxX - minX || text.height * 2 > maxY - minY)) {
         text.size -= 0.1;
      }
      return text;
   }

   override onClicked(e: FederatedPointerEvent): void {
      const pos = this.viewport.screenToWorld(e);
      const global = this.viewport.toGlobal(pos);

      let selectedIndex = -1;

      CountryMapping.forEach(({ index, area, text }) => {
         const country = area;
         if (!country.getBounds().contains(global.x, global.y)) {
            country.tint = 0xffffff;
            return;
         }
         if (!country.containsPoint(global)) {
            country.tint = 0xffffff;
            return;
         }
         country.tint = 0xffeaa7;
         selectedIndex = index;
         Singleton().routeTo(ConquestPage, { text });
      });

      if (selectedIndex !== -1) {
         const neighboring = neighbors(World.objects.countries.geometries as any);
         const neighboringCountries = neighboring[selectedIndex];
         neighboringCountries.forEach((neighbor) => {
            CountryMapping[neighbor].area.tint = 0xfff9e5;
         });
      }
   }

   override backgroundColor(): ColorSource {
      return 0x72d3e6;
   }
}
