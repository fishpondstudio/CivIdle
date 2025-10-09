import { tileToPoint, type Tile } from "./Helper";
import {
   Hex,
   Layout,
   OffsetCoord,
   Point,
   type IHex,
   type ILayout,
   type IOffsetCoord,
   type IPoint,
} from "./Hex";

export interface IGrid {
   layout: ILayout;
   maxX: number;
   maxY: number;
   size: number;
   _distanceCache: Map<number, number>;
   center(): IPoint;
   forEach(cb: (grid: IPoint) => void): void;
   maxPosition(): IPoint;
   positionToGrid(position: IPoint): IPoint;
   isEdge(grid: IPoint, edgeSize: number): boolean;
   isValid(g: IPoint): boolean;
   gridToPosition(grid: IPoint): IPoint;
   xyToPosition(xy: Tile): IPoint;
   getNeighbors(grid: IPoint): IPoint[];
   getRange(grid: IPoint, distance: number): IPoint[];
   distanceTile(xy1: Tile, xy2: Tile): number;
   distance(x1: number, y1: number, x2: number, y2: number): number;
   gridToHex(grid: IPoint, result?: IHex): IHex;
   hexToGrid(hex: IHex): IPoint;
   hexToPosition(hex: IHex): IPoint;
}

export interface IGridConstructor {
   new (maxX: number, maxY: number, size: number): IGrid;
   (): void;
   _oc1: IOffsetCoord;
   _oc2: IOffsetCoord;
   _hex1: IHex;
   _hex2: IHex;
}

const Grid = function (this: IGrid, maxX: number, maxY: number, size: number): void {
   this.layout = new Layout(Layout.pointy, { x: size, y: size }, { x: 0, y: 0 });
   this.maxX = maxX;
   this.maxY = maxY;
   this.size = size;
   this._distanceCache = new Map();
} as IGridConstructor;

Grid.prototype.center = function (): IPoint {
   return {
      x: Math.floor(this.maxX / 2),
      y: Math.floor(this.maxY / 2),
   };
};

Grid.prototype.forEach = function (cb: (grid: IPoint) => void): void {
   for (let x = 0; x < this.maxX; x++) {
      for (let y = 0; y < this.maxY; y++) {
         cb({ x, y });
      }
   }
};

Grid.prototype.maxPosition = function (): IPoint {
   const point = this.gridToPosition(new Point(this.maxX - 1, this.maxY - 1));
   // This is to give an extra padding on the right
   return point;
};

Grid.prototype.positionToGrid = function (position: IPoint): IPoint {
   const o = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, this.layout.pixelToHex(position).round());
   return { x: o.col, y: o.row };
};

Grid.prototype.isEdge = function (grid: IPoint, edgeSize: number): boolean {
   if (
      grid.x < edgeSize ||
      grid.y < edgeSize ||
      grid.x > this.maxX - edgeSize - 1 ||
      grid.y > this.maxY - edgeSize - 1
   ) {
      return true;
   }
   return false;
};

Grid.prototype.isValid = function (g: IPoint): boolean {
   return g.x >= 0 && g.x < this.maxX && g.y >= 0 && g.y < this.maxY;
};

Grid.prototype.gridToPosition = function (grid: IPoint): IPoint {
   return this.layout.hexToPixel(this.gridToHex(grid));
};

Grid.prototype.xyToPosition = function (xy: Tile): IPoint {
   this.gridToHex(tileToPoint(xy), Grid._hex1);
   return this.layout.hexToPixel(Grid._hex1);
};

Grid.prototype.getNeighbors = function (grid: IPoint): IPoint[] {
   const result: IPoint[] = [];
   for (let i = 0; i < 6; i++) {
      this.gridToHex(grid, Grid._hex1);
      Grid._hex1.neighbor(i, Grid._hex1);
      const g = this.hexToGrid(Grid._hex1);
      if (this.isValid(g)) {
         result.push(g);
      }
   }
   return result;
};

Grid.prototype.getRange = function (grid: IPoint, distance: number): IPoint[] {
   const result: IPoint[] = [];
   this.gridToHex(grid).forEachInRange(
      distance,
      (h: IHex) => {
         const g = this.hexToGrid(h);
         if (this.isValid(g)) {
            result.push(g);
         }
      },
      Grid._hex1,
   );
   return result;
};

Grid.prototype.distanceTile = function (xy1: Tile, xy2: Tile): number {
   return this.distance((xy1 >> 16) & 0xffff, xy1 & 0xffff, (xy2 >> 16) & 0xffff, xy2 & 0xffff);
};

Grid._oc1 = new OffsetCoord(0, 0);
Grid._oc2 = new OffsetCoord(0, 0);
Grid._hex1 = new Hex(0, 0, 0);
Grid._hex2 = new Hex(0, 0, 0);

Grid.prototype.distance = function (x1: number, y1: number, x2: number, y2: number): number {
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
   OffsetCoord.roffsetToCube(OffsetCoord.ODD, oc1, hex1);

   const hex2 = Grid._hex2;
   const oc2 = Grid._oc2;
   oc2.col = x2;
   oc2.row = y2;
   OffsetCoord.roffsetToCube(OffsetCoord.ODD, oc2, hex2);

   const distance = hex1.distanceSelf(hex2);

   this._distanceCache.set(key, distance);
   return distance;
};

Grid.prototype.gridToHex = (grid: IPoint, result?: IHex): IHex => {
   Grid._oc1.col = grid.x;
   Grid._oc1.row = grid.y;
   return OffsetCoord.roffsetToCube(OffsetCoord.ODD, Grid._oc1, result);
};

Grid.prototype.hexToGrid = (hex: IHex): IPoint => {
   OffsetCoord.roffsetFromCube(OffsetCoord.ODD, hex, Grid._oc1);
   return { x: Grid._oc1.col, y: Grid._oc1.row };
};

Grid.prototype.hexToPosition = function (hex: IHex): IPoint {
   return this.layout.hexToPixel(hex);
};

export { Grid };
