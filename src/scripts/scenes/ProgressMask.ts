import { SmoothGraphics } from "@pixi/graphics-smooth";
import { IPointData } from "pixi.js";
import { clamp } from "../utilities/Helper";

function rotateXY(x: number, y: number, angle: number): IPointData {
   const rad = (Math.PI * angle) / 180;
   const cosVal = Math.cos(rad);
   const sinVal = Math.sin(rad);
   return { x: cosVal * x - sinVal * y, y: sinVal * x + cosVal * y };
}

function computeMaskPolygon(x: number, y: number, radius: number, angle: number) {
   angle = clamp(angle, 0, 360);
   const delta = rotateXY(0, -2 * radius, angle);
   const pts: IPointData[] = [
      { x, y: y - 2 * radius },
      { x, y },
      { x: x + delta.x, y: y + delta.y },
   ];

   if (angle > 270) pts.push({ x: x - 2 * radius, y });
   if (angle > 180) pts.push({ x, y: y + 2 * radius });
   if (angle > 90) pts.push({ x: x + 2 * radius, y });

   return pts;
}

export class ProgressMask extends SmoothGraphics {
   private readonly _radius: number;
   private readonly _progress: number;

   constructor(radius: number) {
      super();
      this._radius = radius;
      this._progress = 0;
   }

   public get progress(): number {
      return this._progress;
   }

   public set progress(zeroToOne: number) {
      this.clear();
      const pts = computeMaskPolygon(0, 0, this._radius, zeroToOne * 360);
      this.beginFill(0xffffff, 1, true);
      pts.forEach(({ x, y }) => {
         this.lineTo(x, y);
      });
      this.lineTo(pts[0].x, pts[0].y);
      this.endFill();
   }
}
