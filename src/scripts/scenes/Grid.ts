import type { SmoothGraphics } from "@pixi/graphics-smooth";
import { BitmapText, Polygon } from "pixi.js";
import { xyToPoint } from "../utilities/Helper";
import { Hex, Layout, OffsetCoord, Point } from "../utilities/Hex";
import { ObjectPool } from "../utilities/ObjectPool";
import { Fonts } from "../visuals/Fonts";

class HexPool extends ObjectPool<Hex> {
   protected override create(): Hex {
      return new Hex(0, 0, 0);
   }
   protected onAllocate(obj: Hex): void {
      obj.q = 0;
      obj.r = 0;
      obj.s = 0;
   }
   protected onRelease(obj: Hex): void {}
}

class OffsetCoordPool extends ObjectPool<OffsetCoord> {
   protected override create(): OffsetCoord {
      return new OffsetCoord(0, 0);
   }
   protected onAllocate(obj: OffsetCoord): void {
      obj.row = 0;
      obj.col = 0;
   }
   protected onRelease(obj: OffsetCoord): void {}
}

export class Grid {
   layout: Layout;
   maxX: number;
   maxY: number;
   size: number;

   constructor(maxX: number, maxY: number, size: number) {
      this.layout = new Layout(Layout.pointy, { x: size, y: size }, { x: 0, y: 0 });
      this.maxX = maxX;
      this.maxY = maxY;
      this.size = size;
   }

   public drawGrid(graphics: SmoothGraphics): void {
      this.forEach((hex) => {
         this.drawCorners(this.layout.polygonCorners(this.gridToHex(hex)), graphics);
      });
   }

   public center(): Point {
      return {
         x: Math.floor(this.maxX / 2),
         y: Math.floor(this.maxY / 2),
      };
   }

   public forEach(cb: (grid: Point) => void) {
      for (let x = 0; x < this.maxX; x++) {
         for (let y = 0; y < this.maxY; y++) {
            if (this.isEdge({ x, y })) {
               continue;
            }
            cb({ x, y });
         }
      }
   }

   private drawGridDebugInfo(x: number, y: number, graphics: SmoothGraphics) {
      const pos = this.gridToPosition({ x, y });
      const font = new BitmapText(`${x},${y}\n(${Math.round(pos.x)},${Math.round(pos.y)})`, {
         fontName: Fonts.Marcellus,
         fontSize: 14,
         align: "center",
         tint: 0xffffff,
      });
      graphics.addChild(font).position.set(pos.x - font.width / 2, pos.y - font.height / 2);
   }

   public maxPosition(): Point {
      const point = this.gridToPosition(new Point(this.maxX - 1, this.maxY - 1));
      // This is to give an extra padding on the right
      point.x += (Math.sqrt(3) * this.size) / 2;
      return point;
   }

   public drawSelected(grid: Point, graphics: SmoothGraphics): void {
      this.drawCorners(this.layout.polygonCorners(this.gridToHex(grid)), graphics);
   }

   public positionToGrid(position: Point): Point {
      const o = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, this.layout.pixelToHex(position).round());
      return { x: o.col, y: o.row };
   }

   public isEdge(grid: Point, edgeSize = 1) {
      if (
         grid.x < edgeSize ||
         grid.y < edgeSize ||
         grid.x > this.maxX - edgeSize - 1 ||
         grid.y > this.maxY - edgeSize - 1
      ) {
         return true;
      }
      return false;
   }

   public isValid(g: Point, edgeSize = 1): boolean {
      return g.x >= edgeSize && g.x < this.maxX - edgeSize && g.y >= edgeSize && g.y < this.maxY - edgeSize;
   }

   public gridToPosition(grid: Point): Point {
      return this.layout.hexToPixel(this.gridToHex(grid));
   }

   public xyToPosition(xy: string): Point {
      return this.layout.hexToPixel(this.gridToHex(xyToPoint(xy)));
   }

   public getNeighbors(grid: Point): Point[] {
      const result: Point[] = [];
      for (let i = 0; i < 6; i++) {
         const hex = this.gridToHex(grid).neighbor(i);
         const g = this.hexToGrid(hex);
         if (this.isValid(g)) {
            result.push(g);
         }
      }
      return result;
   }

   private static _hexPool = new HexPool();
   private static _offsetCoordPool = new OffsetCoordPool();

   private static _distanceCache: Record<number, number> = {};

   public distanceXy(xy1: string, xy2: string): number {
      const a = xyToPoint(xy1);
      const b = xyToPoint(xy2);
      return this.distance(a.x, a.y, b.x, b.y);
   }

   public distance(x1: number, y1: number, x2: number, y2: number): number {
      const key1 = y1 * this.maxX + x1;
      const key2 = y2 * this.maxX + x2;
      const key = key1 >= key2 ? (key1 << 16) + key2 : (key2 << 16) + key1;
      const cached = Grid._distanceCache[key];

      // We use cached value in prod, but in dev, we want to validate our cache is good
      // if (!import.meta.env.DEV && cached) {
      //    return cached;
      // }

      if (cached) {
         return cached;
      }

      const hex1 = Grid._hexPool.allocate();
      const oc1 = Grid._offsetCoordPool.allocate();
      oc1.row = x1;
      oc1.col = y1;
      OffsetCoord.roffsetToCubeNoAlloc(OffsetCoord.ODD, oc1, hex1);

      const hex2 = Grid._hexPool.allocate();
      const oc2 = Grid._offsetCoordPool.allocate();
      oc2.row = x2;
      oc2.col = y2;
      OffsetCoord.roffsetToCubeNoAlloc(OffsetCoord.ODD, oc2, hex2);

      const distance = hex1.distanceSelf(hex2);
      Grid._hexPool.release(hex1);
      Grid._hexPool.release(hex2);
      Grid._offsetCoordPool.release(oc1);
      Grid._offsetCoordPool.release(oc2);

      // if (cached) {
      //    console.assert(distance === cached);
      // }

      Grid._distanceCache[key] = distance;
      return distance;
   }

   public gridToHex(grid: Point): Hex {
      return OffsetCoord.roffsetToCube(OffsetCoord.ODD, new OffsetCoord(grid.x, grid.y));
   }

   public hexToGrid(hex: Hex): Point {
      const oc = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, hex);
      return { x: oc.col, y: oc.row };
   }

   public hexToPosition(hex: Hex): Point {
      return this.layout.hexToPixel(hex);
   }

   private drawCorners(corners: Point[], graphics: SmoothGraphics) {
      graphics.drawPolygon(new Polygon(corners));
   }
}
