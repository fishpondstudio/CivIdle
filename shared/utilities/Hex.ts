// Generated code -- CC0 -- No Rights Reserved -- http://www.redblobgames.com/grids/hexagons/

export interface IPoint {
   x: number;
   y: number;
}

export interface IPointConstructor {
   new (x: number, y: number): IPoint;
   (): void;
}

const Point = function (this: IPoint, x: number, y: number): void {
   this.x = x;
   this.y = y;
} as IPointConstructor;

export interface IHex {
   q: number;
   r: number;
   s: number;
   set(q: number, r: number, s: number): IHex;
   add(b: IHex, result?: IHex): IHex;
   subtract(b: IHex): IHex;
   subtractSelf(b: IHex): IHex;
   scale(k: number): IHex;
   rotateLeft(): IHex;
   rotateRight(): IHex;
   neighbor(direction: number, result?: IHex): IHex;
   diagonalNeighbor(direction: number): IHex;
   len(): number;
   distance(b: IHex): number;
   distanceSelf(b: IHex): number;
   round(): IHex;
   lerp(b: IHex, t: number): IHex;
   range(distance: number): IHex[];
   forEachInRange(distance: number, func: (hex: IHex) => void, temp?: IHex): void;
   linedraw(b: IHex): IHex[];
}

export interface IHexConstructor {
   new (q: number, r: number, s: number): IHex;
   (): void;
   directions: IHex[];
   direction(direction: number): IHex;
   diagonals: IHex[];
}

const Hex = function (this: IHex, q: number, r: number, s: number): void {
   if (Math.round(q + r + s) !== 0) throw "q + r + s must be 0";
   this.q = q;
   this.r = r;
   this.s = s;
} as IHexConstructor;

Hex.prototype.set = function (q: number, r: number, s: number): IHex {
   this.q = q;
   this.r = r;
   this.s = s;
   return this;
};

Hex.prototype.add = function (b: IHex, result?: IHex): IHex {
   const res = result ?? new Hex(0, 0, 0);
   res.q = this.q + b.q;
   res.r = this.r + b.r;
   res.s = this.s + b.s;
   return res;
};

Hex.prototype.subtract = function (b: IHex): IHex {
   return new Hex(this.q - b.q, this.r - b.r, this.s - b.s);
};

Hex.prototype.subtractSelf = function (b: IHex): IHex {
   this.q -= b.q;
   this.r -= b.r;
   this.s -= b.s;
   return this;
};

Hex.prototype.scale = function (k: number): IHex {
   return new Hex(this.q * k, this.r * k, this.s * k);
};

Hex.prototype.rotateLeft = function (): IHex {
   return new Hex(-this.s, -this.q, -this.r);
};

Hex.prototype.rotateRight = function (): IHex {
   return new Hex(-this.r, -this.s, -this.q);
};

Hex.directions = [
   new Hex(1, 0, -1),
   new Hex(1, -1, 0),
   new Hex(0, -1, 1),
   new Hex(-1, 0, 1),
   new Hex(-1, 1, 0),
   new Hex(0, 1, -1),
];

Hex.direction = (direction: number): IHex => {
   return Hex.directions[direction];
};

Hex.prototype.neighbor = function (direction: number, result?: IHex): IHex {
   const res = result ?? new Hex(0, 0, 0);
   this.add(Hex.direction(direction), res);
   return res;
};

Hex.diagonals = [
   new Hex(2, -1, -1),
   new Hex(1, -2, 1),
   new Hex(-1, -1, 2),
   new Hex(-2, 1, 1),
   new Hex(-1, 2, -1),
   new Hex(1, 1, -2),
];

Hex.prototype.diagonalNeighbor = function (direction: number): IHex {
   return this.add(Hex.diagonals[direction]);
};

Hex.prototype.len = function (): number {
   return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
};

Hex.prototype.distance = function (b: IHex): number {
   return this.subtract(b).len();
};

Hex.prototype.distanceSelf = function (b: IHex): number {
   return this.subtractSelf(b).len();
};

Hex.prototype.round = function (): IHex {
   let qi: number = Math.round(this.q);
   let ri: number = Math.round(this.r);
   let si: number = Math.round(this.s);
   const q_diff: number = Math.abs(qi - this.q);
   const r_diff: number = Math.abs(ri - this.r);
   const s_diff: number = Math.abs(si - this.s);
   if (q_diff > r_diff && q_diff > s_diff) {
      qi = -ri - si;
   } else if (r_diff > s_diff) {
      ri = -qi - si;
   } else {
      si = -qi - ri;
   }
   return new Hex(qi, ri, si);
};

Hex.prototype.lerp = function (b: IHex, t: number): IHex {
   return new Hex(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
};

Hex.prototype.range = function (distance: number): IHex[] {
   const result: IHex[] = [];
   for (let q = -distance; q <= distance; ++q) {
      for (let r = Math.max(-distance, -q - distance); r <= Math.min(distance, -q + distance); ++r) {
         const s = -q - r;
         result.push(this.add(new Hex(q, r, s)));
      }
   }
   return result;
};

Hex.prototype.forEachInRange = function (distance: number, func: (hex: IHex) => void, temp?: IHex): void {
   for (let q = -distance; q <= distance; ++q) {
      for (let r = Math.max(-distance, -q - distance); r <= Math.min(distance, -q + distance); ++r) {
         const s = -q - r;
         const hex = temp ?? new Hex(0, 0, 0);
         hex.q = q;
         hex.r = r;
         hex.s = s;
         this.add(hex, hex);
         func(hex);
      }
   }
};

Hex.prototype.linedraw = function (b: IHex): IHex[] {
   const N: number = this.distance(b);
   const a_nudge: IHex = new Hex(this.q + 1e-6, this.r + 1e-6, this.s - 2e-6);
   const b_nudge: IHex = new Hex(b.q + 1e-6, b.r + 1e-6, b.s - 2e-6);
   const results: IHex[] = [];
   const step: number = 1.0 / Math.max(N, 1);
   for (let i = 0; i <= N; i++) {
      results.push(a_nudge.lerp(b_nudge, step * i).round());
   }
   return results;
};

export interface IOffsetCoord {
   col: number;
   row: number;
}

export interface IOffsetCoordConstructor {
   new (col: number, row: number): IOffsetCoord;
   (): void;
   EVEN: number;
   ODD: number;
   qoffsetFromCube(offset: number, h: IHex): IOffsetCoord;
   qoffsetToCube(offset: number, h: IOffsetCoord): IHex;
   roffsetFromCube(offset: number, h: IHex, result?: IOffsetCoord): IOffsetCoord;
   roffsetToCube(offset: number, h: IOffsetCoord, result?: IHex): IHex;
}

const OffsetCoord = function (this: IOffsetCoord, col: number, row: number): void {
   this.col = col;
   this.row = row;
} as IOffsetCoordConstructor;

OffsetCoord.EVEN = 1;
OffsetCoord.ODD = -1;

OffsetCoord.qoffsetFromCube = (offset: number, h: IHex): IOffsetCoord => {
   const col: number = h.q;
   const row: number = h.r + (h.q + offset * (h.q & 1)) / 2;
   if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw "offset must be EVEN (+1) or ODD (-1)";
   }
   return new OffsetCoord(col, row);
};

OffsetCoord.qoffsetToCube = (offset: number, h: IOffsetCoord): IHex => {
   const q: number = h.col;
   const r: number = h.row - (h.col + offset * (h.col & 1)) / 2;
   const s: number = -q - r;
   if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw "offset must be EVEN (+1) or ODD (-1)";
   }
   return new Hex(q, r, s);
};

OffsetCoord.roffsetFromCube = (offset: number, h: IHex, result?: IOffsetCoord): IOffsetCoord => {
   const col: number = h.q + (h.r + offset * (h.r & 1)) / 2;
   const row: number = h.r;
   if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw "offset must be EVEN (+1) or ODD (-1)";
   }
   const res = result ?? new OffsetCoord(0, 0);
   res.col = col;
   res.row = row;
   return res;
};

OffsetCoord.roffsetToCube = (offset: number, h: IOffsetCoord, result?: IHex): IHex => {
   const q: number = h.col - (h.row + offset * (h.row & 1)) / 2;
   const r: number = h.row;
   const s: number = -q - r;
   if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
      throw "offset must be EVEN (+1) or ODD (-1)";
   }
   const res = result ?? new Hex(0, 0, 0);
   res.q = q;
   res.r = r;
   res.s = s;
   return res;
};

export interface IDoubledCoord {
   col: number;
   row: number;
   qdoubledToCube(): IHex;
   rdoubledToCube(): IHex;
}

export interface IDoubledCoordConstructor {
   new (col: number, row: number): IDoubledCoord;
   (): void;
   qdoubledFromCube(h: IHex): IDoubledCoord;
   rdoubledFromCube(h: IHex): IDoubledCoord;
}

const DoubledCoord = function (this: IDoubledCoord, col: number, row: number): void {
   this.col = col;
   this.row = row;
} as IDoubledCoordConstructor;

DoubledCoord.qdoubledFromCube = (h: IHex): IDoubledCoord => {
   const col: number = h.q;
   const row: number = 2 * h.r + h.q;
   return new DoubledCoord(col, row);
};

DoubledCoord.prototype.qdoubledToCube = function (): IHex {
   const q: number = this.col;
   const r: number = (this.row - this.col) / 2;
   const s: number = -q - r;
   return new Hex(q, r, s);
};

DoubledCoord.rdoubledFromCube = (h: IHex): IDoubledCoord => {
   const col: number = 2 * h.q + h.r;
   const row: number = h.r;
   return new DoubledCoord(col, row);
};

DoubledCoord.prototype.rdoubledToCube = function (): IHex {
   const q: number = (this.col - this.row) / 2;
   const r: number = this.row;
   const s: number = -q - r;
   return new Hex(q, r, s);
};

export interface IOrientation {
   f0: number;
   f1: number;
   f2: number;
   f3: number;
   b0: number;
   b1: number;
   b2: number;
   b3: number;
   start_angle: number;
}

export interface IOrientationConstructor {
   new (
      f0: number,
      f1: number,
      f2: number,
      f3: number,
      b0: number,
      b1: number,
      b2: number,
      b3: number,
      start_angle: number,
   ): IOrientation;
   (): void;
}

const Orientation = function (
   this: IOrientation,
   f0: number,
   f1: number,
   f2: number,
   f3: number,
   b0: number,
   b1: number,
   b2: number,
   b3: number,
   start_angle: number,
): void {
   this.f0 = f0;
   this.f1 = f1;
   this.f2 = f2;
   this.f3 = f3;
   this.b0 = b0;
   this.b1 = b1;
   this.b2 = b2;
   this.b3 = b3;
   this.start_angle = start_angle;
} as IOrientationConstructor;

export interface ILayout {
   orientation: IOrientation;
   size: IPoint;
   origin: IPoint;
   hexToPixel(h: IHex): IPoint;
   pixelToHex(p: IPoint): IHex;
   hexCornerOffset(corner: number): IPoint;
   polygonCorners(h: IHex): IPoint[];
}

export interface ILayoutConstructor {
   new (orientation: IOrientation, size: IPoint, origin: IPoint): ILayout;
   (): void;
   pointy: IOrientation;
   flat: IOrientation;
}

const Layout = function (this: ILayout, orientation: IOrientation, size: IPoint, origin: IPoint): void {
   this.orientation = orientation;
   this.size = size;
   this.origin = origin;
} as ILayoutConstructor;

Layout.pointy = new Orientation(
   Math.sqrt(3.0),
   Math.sqrt(3.0) / 2.0,
   0.0,
   3.0 / 2.0,
   Math.sqrt(3.0) / 3.0,
   -1.0 / 3.0,
   0.0,
   2.0 / 3.0,
   0.5,
);

Layout.flat = new Orientation(
   3.0 / 2.0,
   0.0,
   Math.sqrt(3.0) / 2.0,
   Math.sqrt(3.0),
   2.0 / 3.0,
   0.0,
   -1.0 / 3.0,
   Math.sqrt(3.0) / 3.0,
   0.0,
);

Layout.prototype.hexToPixel = function (h: IHex): IPoint {
   const M: IOrientation = this.orientation;
   const size: IPoint = this.size;
   const origin: IPoint = this.origin;
   const x: number = (M.f0 * h.q + M.f1 * h.r) * size.x;
   const y: number = (M.f2 * h.q + M.f3 * h.r) * size.y;
   return new Point(x + origin.x, y + origin.y);
};

Layout.prototype.pixelToHex = function (p: IPoint): IHex {
   const M: IOrientation = this.orientation;
   const size: IPoint = this.size;
   const origin: IPoint = this.origin;
   const pt: IPoint = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
   const q: number = M.b0 * pt.x + M.b1 * pt.y;
   const r: number = M.b2 * pt.x + M.b3 * pt.y;
   return new Hex(q, r, -q - r);
};

Layout.prototype.hexCornerOffset = function (corner: number): IPoint {
   const M: IOrientation = this.orientation;
   const size: IPoint = this.size;
   const angle: number = (2.0 * Math.PI * (M.start_angle - corner)) / 6.0;
   return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
};

Layout.prototype.polygonCorners = function (h: IHex): IPoint[] {
   const corners: IPoint[] = [];
   const center: IPoint = this.hexToPixel(h);
   for (let i = 0; i < 6; i++) {
      const offset: IPoint = this.hexCornerOffset(i);
      corners.push(new Point(center.x + offset.x, center.y + offset.y));
   }
   return corners;
};

export { DoubledCoord, Hex, Layout, OffsetCoord, Orientation, Point };
