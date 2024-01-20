import type { IPointData } from "pixi.js";
import { pointToTile, tileToPoint, type Tile } from "../../../shared/utilities/Helper";
import { v2 } from "../../../shared/utilities/Vector2";
import { BUILDING_DEFAULT_VISION } from "../definitions/BuildingDefinitions";
import type { Grid } from "../scenes/Grid";
import { exploreTile, isNaturalWonder } from "./BuildingLogic";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import type { ITileData } from "./Tile";

export function ensureTileFogOfWar(xy: Tile, gameState: GameState, grid: Grid): Tile[] {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (!building || isNaturalWonder(building.type)) {
      return [];
   }
   const result: Set<Tile> = new Set();
   exploreTile(xy, gameState);
   result.add(xy);
   const point = tileToPoint(xy);
   let targets = [point];
   for (let i = 0; i < (Config.Building[building.type]?.vision ?? BUILDING_DEFAULT_VISION); i++) {
      const newTargets: IPointData[] = [];
      targets.forEach((t) => {
         const neighbors = grid.getNeighbors(t);
         neighbors.forEach((n) => {
            const xy = pointToTile(n);
            const tile = gameState.tiles.get(xy);
            if (tile) {
               exploreTile(xy, gameState);
               result.add(xy);
               newTargets.push(n);
            }
         });
      });
      targets = newTargets;
   }
   return Array.from(result.values());
}

export function findNearest(
   predicate: (tile: ITileData) => boolean,
   target: IPointData,
   grid: Grid,
   gs: GameState,
): ITileData | null {
   const position = grid.gridToPosition(target);
   const targetXp = pointToTile(target);
   let minDistSqr = Infinity;
   let tile: ITileData | null = null;
   gs.tiles.forEach((t, xy) => {
      if (!predicate(t)) {
         return;
      }
      // Do NOT find myself!
      if (xy === targetXp) {
         return;
      }
      const distSqr = v2(grid.gridToPosition(tileToPoint(xy)))
         .subtractSelf(position)
         .lengthSqr();
      if (distSqr < minDistSqr) {
         minDistSqr = distSqr;
         tile = t;
      }
   });
   return tile;
}
