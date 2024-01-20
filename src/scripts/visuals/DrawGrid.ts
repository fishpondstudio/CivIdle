import type { SmoothGraphics } from "@pixi/graphics-smooth";
import { Polygon } from "pixi.js";
import type { Grid } from "../../../shared/utilities/Grid";
import type { Point } from "../../../shared/utilities/Hex";

export function drawGrid(self: Grid, graphics: SmoothGraphics): void {
   self.forEach((hex) => {
      drawCorners(self.layout.polygonCorners(self.gridToHex(hex)), graphics);
   });
}

export function drawSelected(self: Grid, grid: Point, graphics: SmoothGraphics): void {
   drawCorners(self.layout.polygonCorners(self.gridToHex(grid)), graphics);
}

export function drawCorners(corners: Point[], graphics: SmoothGraphics) {
   graphics.drawPolygon(new Polygon(corners));
}
