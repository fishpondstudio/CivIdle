import { BitmapText, Container } from "pixi.js";
import { Fonts } from "../generated/FontBundle";
import { xyToPoint } from "../utilities/Helper";
import { Hex, Layout, OffsetCoord, Point } from "../utilities/Hex";

interface IGraphics extends Container {
   lineTo: (x: number, y: number) => IGraphics;
   moveTo: (x: number, y: number) => IGraphics;
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

   public drawGrid(graphics: IGraphics): void {
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

   private drawGridDebugInfo(x: number, y: number, graphics: IGraphics) {
      const pos = this.gridToPosition({ x, y });
      const font = new BitmapText(`${x},${y}\n(${Math.round(pos.x)},${Math.round(pos.y)})`, {
         fontName: Fonts.MarcellusRegular,
         fontSize: 14,
         align: "center",
      });
      graphics.addChild(font).position.set(pos.x - font.width / 2, pos.y - font.height / 2);
   }

   public maxPosition(): Point {
      const point = this.gridToPosition(new Point(this.maxX - 1, this.maxY - 1));
      // This is to give an extra padding on the right
      point.x += (Math.sqrt(3) * this.size) / 2;
      return point;
   }

   public drawSelected(grid: Point, graphics: IGraphics): void {
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
         result.push(this.hexToGrid(hex));
      }
      return result;
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

   private drawCorners(corners: Point[], graphics: IGraphics) {
      const [first, ...others] = corners;
      graphics.moveTo(first.x, first.y);
      others.forEach((point, index) => {
         graphics.lineTo(point.x, point.y);
      });
      graphics.lineTo(first.x, first.y);
   }
}
