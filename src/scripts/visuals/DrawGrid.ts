import type { SmoothGraphics } from "@pixi/graphics-smooth";
import { Polygon } from "pixi.js";
import type { IGrid } from "../../../shared/utilities/Grid";
import type { IPoint } from "../../../shared/utilities/Hex";

export function drawGrid(self: IGrid, graphics: SmoothGraphics): void {
   self.forEach((hex) => {
      drawCorners(self.layout.polygonCorners(self.gridToHex(hex)), graphics);
   });
}

export function drawSelected(self: IGrid, grid: IPoint, graphics: SmoothGraphics): void {
   drawCorners(self.layout.polygonCorners(self.gridToHex(grid)), graphics);
}

export function drawCorners(corners: IPoint[], graphics: SmoothGraphics) {
   graphics.drawPolygon(new Polygon(corners));
}
