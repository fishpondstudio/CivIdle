import { SmoothGraphics } from "@pixi/graphics-smooth";
import { geoMercator, geoPath } from "d3-geo";
import { Container, Sprite, type ColorSource, type FederatedPointerEvent } from "pixi.js";
import { feature } from "topojson-client";
import { Grid } from "../../../shared/utilities/Grid";
import { pointToTile, tileToPoint, type Tile } from "../../../shared/utilities/Helper";
import { UnicodeText } from "../../../shared/utilities/UnicodeText";
import World from "../../images/countries-110m.json";
import { getTexture } from "../logic/VisualLogic";
import { ConquestPage } from "../ui/ConquestPage";
import { calculateArea, calculateBounds, calculateCentroid } from "../utilities/SVGGraphics/SVGPathParser";
import { Scene, type ISceneContext } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import { Fonts } from "../visuals/Fonts";
import Land from "./Land.json";

export const CountryMapping: { index: number; area: SmoothGraphics; text: UnicodeText }[] = [];
const OceanColor = 0xabd3de;
const LandColor = 0xf2efe9;
const SelectedColor = 0xffeaa7;
const NeighborColor = 0xfff3cc;
const BorderColor = 0xbfaaba;
const divider = 32;
const grid = new Grid(289, 230, 64 / divider);

export class ConquestScene extends Scene {
   private _mapContainer: Container<SmoothGraphics>;
   private _countryBorders: SmoothGraphics;
   private _countryLabels: Container<UnicodeText>;
   private _tiles = new Map<Tile, Sprite>();

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

      const max = grid.maxPosition();

      this.viewport.setWorldSize(max.x, max.y);
      const minZoom = Math.max(app.screen.width / max.x, app.screen.height / max.y);

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

      // const labels: Record<string, { x: number; y: number; angle: number; size: number }> = JSON.parse(
      //    localStorage.getItem("CountryMapping") ?? "{}",
      // );
      // const labels: Record<string, { x: number; y: number; angle: number; size: number }> = WorldLabel;
      countries.features.forEach((feature: any, index: number) => {
         graphics = this._mapContainer.addChild(new SmoothGraphics());
         graphics.beginFill(0xffffff);
         path(feature.geometry);
         graphics.endFill();
         graphics.tint = LandColor;

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
         // const cached = labels[feature.properties.name];
         // if (cached) {
         //    const text = this._countryLabels.addChild(
         //       new UnicodeText(
         //          feature.properties.name,
         //          {
         //             fontName: `${Fonts.Cabin}NoShadow`,
         //             tint: 0x666666,
         //          },
         //          {
         //             fontFamily: "'Inter Tight', serif",
         //             fill: 0x666666,
         //          },
         //       ),
         //    );
         //    text.anchor.set(0.5, 0.5);
         //    text.size = cached.size;
         //    text.x = cached.x;
         //    text.y = cached.y;
         //    text.angle = cached.angle;
         //    CountryMapping.push({ index, area: graphics, text });
         // } else {
         //    const text = this._drawText(feature.properties.name, maxPoints);
         //    CountryMapping.push({ index, area: graphics, text });
         // }
      });

      // graphics = this._countryBorders;
      // graphics.lineStyle({
      //    color: BorderColor,
      //    width: 0.2,
      //    alignment: 0.5,
      // });
      // const borders = mesh(World as any, World.objects.countries as any, (a, b) => a !== b);
      // path(borders);

      // shift all tiles x by -1, and wrap around!
      const maxX = Math.max(...Land.map((t) => tileToPoint(t).x));
      console.log(
         JSON.stringify(
            Land.map((t) => {
               const { x, y } = tileToPoint(t);
               return pointToTile({ x: (x - 1) % maxX, y });
            }),
         ),
      );

      const land = new Set<Tile>(Land);

      grid.forEach((g) => {
         const tile = pointToTile(g);

         const sprite = this.viewport.addChild(new Sprite(getTexture("Misc_Tile1", this.context.textures)));
         sprite.scale.set(0.5 / divider);
         sprite.anchor.set(0.5, 0.5);
         const position = grid.gridToPosition(g);
         sprite.position.set(position.x, position.y);

         this._tiles.set(tile, sprite);

         if (land.has(tile)) {
            sprite.visible = true;
         } else {
            sprite.visible = false;
         }
      });
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
      // const global = this.viewport.toGlobal(pos);

      const point = grid.positionToGrid(pos);
      const tile = pointToTile(point);

      const sprite = this._tiles.get(tile);
      if (sprite) {
         sprite.visible = !sprite.visible;
         const land = new Set<Tile>(Land);
         if (sprite.visible) {
            land.add(tile);
         } else {
            land.delete(tile);
         }
      }

      console.log(
         JSON.stringify(
            Array.from(this._tiles)
               .filter(([_, sprite]) => sprite.visible)
               .map(([tile]) => tile),
         ),
      );

      // let selectedIndex = -1;

      // CountryMapping.forEach(({ index, area, text }) => {
      //    const country = area;
      //    if (!country.getBounds().contains(global.x, global.y)) {
      //       country.tint = LandColor;
      //       return;
      //    }
      //    if (!country.containsPoint(global)) {
      //       country.tint = LandColor;
      //       return;
      //    }
      //    country.tint = SelectedColor;
      //    selectedIndex = index;
      //    Singleton().routeTo(ConquestPage, { text });
      // });

      // if (selectedIndex !== -1) {
      //    const neighboring = neighbors(World.objects.countries.geometries as any);
      //    const neighboringCountries = neighboring[selectedIndex];
      //    neighboringCountries.forEach((neighbor) => {
      //       CountryMapping[neighbor].area.tint = NeighborColor;
      //    });
      // }
   }

   override backgroundColor(): ColorSource {
      return OceanColor;
   }
}
