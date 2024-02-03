import { type Tile, tileToPoint } from "./Helper";
import { Hex, Layout, OffsetCoord, Point } from "./Hex";

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

   // private drawGridDebugInfo(x: number, y: number, graphics: SmoothGraphics) {
   //    const pos = this.gridToPosition({ x, y });
   //    const font = new BitmapText(`${x},${y}\n(${Math.round(pos.x)},${Math.round(pos.y)})`, {
   //       fontName: Fonts.Marcellus,
   //       fontSize: 14,
   //       align: "center",
   //       tint: 0xffffff,
   //    });
   //    graphics.addChild(font).position.set(pos.x - font.width / 2, pos.y - font.height / 2);
   // }

   public maxPosition(): Point {
      const point = this.gridToPosition(new Point(this.maxX - 1, this.maxY - 1));
      // This is to give an extra padding on the right
      point.x += (Math.sqrt(3) * this.size) / 2;
      return point;
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

   public xyToPosition(xy: Tile): Point {
      return this.layout.hexToPixel(this.gridToHex(tileToPoint(xy)));
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

   private _distanceCache: Map<number, number> = new Map();

   public distanceTile(xy1: Tile, xy2: Tile): number {
      return this.distance((xy1 >> 16) & 0xffff, xy1 & 0xffff, (xy2 >> 16) & 0xffff, xy2 & 0xffff);
   }

   private static _oc1 = new OffsetCoord(0, 0);
   private static _oc2 = new OffsetCoord(0, 0);
   private static _hex1 = new Hex(0, 0, 0);
   private static _hex2 = new Hex(0, 0, 0);

   public distance(x1: number, y1: number, x2: number, y2: number): number {
      const key1 = y1 * this.maxX + x1;
      const key2 = y2 * this.maxX + x2;
      const key = (Math.max(key1, key2) << 16) | Math.min(key1, key2);
      const cached = this._distanceCache.get(key);

      if (cached) {
         return cached;
      }

      const hex1 = Grid._hex1;
      const oc1 = Grid._oc1;
      oc1.col = x1;
      oc1.row = y1;
      OffsetCoord.roffsetToCubeNoAlloc(OffsetCoord.ODD, oc1, hex1);

      const hex2 = Grid._hex2;
      const oc2 = Grid._oc2;
      oc2.col = x2;
      oc2.row = y2;
      OffsetCoord.roffsetToCubeNoAlloc(OffsetCoord.ODD, oc2, hex2);

      const distance = hex1.distanceSelf(hex2);

      this._distanceCache.set(key, distance);
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
}
