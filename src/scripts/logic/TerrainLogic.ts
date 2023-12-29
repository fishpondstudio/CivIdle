import type { IPointData } from "pixi.js";
import { BUILDING_DEFAULT_VISION } from "../definitions/BuildingDefinitions";
import type { Grid } from "../scenes/Grid";
import { forEach, keysOf, pointToXy, xyToPoint } from "../utilities/Helper";
import { v2 } from "../utilities/Vector2";
import { exploreTile, isNaturalWonder } from "./BuildingLogic";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import type { ITileData } from "./Tile";

export function ensureTileFogOfWar(xy: string, gameState: GameState, grid: Grid): string[] {
   const tile = gameState.tiles[xy];
   const building = tile?.building;
   if (!building || isNaturalWonder(building.type)) {
      return [];
   }
   const result: Record<string, true> = {};
   exploreTile(xy, gameState);
   result[xy] = true;
   const point = xyToPoint(xy);
   let targets = [point];
   for (let i = 0; i < (Config.Building[building.type]?.vision ?? BUILDING_DEFAULT_VISION); i++) {
      const newTargets: IPointData[] = [];
      targets.forEach((t) => {
         const neighbors = grid.getNeighbors(t);
         neighbors.forEach((n) => {
            const xy = pointToXy(n);
            const tile = gameState.tiles[xy];
            if (tile) {
               exploreTile(xy, gameState);
               result[xy] = true;
               newTargets.push(n);
            }
         });
      });
      targets = newTargets;
   }
   return keysOf(result);
}

export function findNearest(
   predicate: (tile: ITileData) => boolean,
   target: IPointData,
   grid: Grid,
   gs: GameState,
): ITileData | null {
   const position = grid.gridToPosition(target);
   const targetXp = pointToXy(target);
   let minDistSqr = Infinity;
   let tile: ITileData | null = null;
   forEach(gs.tiles, (xy, t) => {
      if (!predicate(t)) {
         return;
      }
      // Do NOT find myself!
      if (xy === targetXp) {
         return;
      }
      const distSqr = v2(grid.gridToPosition(xyToPoint(xy)))
         .subtractSelf(position)
         .lengthSqr();
      if (distSqr < minDistSqr) {
         minDistSqr = distSqr;
         tile = t;
      }
   });
   return tile;
}
