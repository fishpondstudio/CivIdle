import { IPointData } from "pixi.js";
import { BUILDING_DEFAULT_VISION } from "../definitions/BuildingDefinitions";
import { Grid } from "../scenes/Grid";
import { forEach, keysOf, pointToXy, xyToPoint } from "../utilities/Helper";
import { v2 } from "../utilities/Vector2";
import { isNaturalWonder } from "./BuildingLogic";
import { GameState } from "./GameState";
import { Tick } from "./TickLogic";
import { ITileData } from "./Tile";

export function ensureTileFogOfWar(xy: string, gameState: GameState, grid: Grid): string[] {
   const tile = gameState.tiles[xy];
   const building = tile?.building;
   if (!building || isNaturalWonder(building.type)) {
      return [];
   }
   const result: Record<string, true> = {};
   gameState.tiles[xy].explored = true;
   result[xy] = true;
   const point = xyToPoint(xy);
   let targets = [point];
   for (let i = 0; i < (Tick.current.buildings[building.type]?.vision ?? BUILDING_DEFAULT_VISION); i++) {
      const newTargets: IPointData[] = [];
      targets.forEach((t) => {
         const neighbors = grid.getNeighbors(t);
         neighbors.forEach((n) => {
            const xy = pointToXy(n);
            gameState.tiles[xy].explored = true;
            result[xy] = true;
            newTargets.push(n);
         });
      });
      targets = newTargets;
   }
   return keysOf(result);
}

export function findNearest(
   predicate: (tile: ITileData) => boolean,
   point: IPointData,
   grid: Grid,
   gs: GameState
): ITileData | null {
   const position = grid.gridToPosition(point);
   let minDistSqr = Infinity;
   let tile: ITileData | null = null;
   forEach(gs.tiles, (xy, t) => {
      if (!predicate(t)) {
         return;
      }
      const distSqr = v2(grid.gridToPosition(xyToPoint(xy)))
         .subtract(position)
         .lengthSqr();
      if (distSqr < minDistSqr) {
         minDistSqr = distSqr;
         tile = t;
      }
   });
   return tile;
}
