import { BUILDING_DEFAULT_VISION } from "../definitions/BuildingDefinitions";
import type { Grid } from "../utilities/Grid";
import { IPointData, pointToTile, tileToPoint, type Tile } from "../utilities/Helper";
import { v2 } from "../utilities/Vector2";
import { exploreTile, isNaturalWonder } from "./BuildingLogic";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { getGrid } from "./IntraTickCache";
import type { ITileData } from "./Tile";

export function ensureTileFogOfWar(xy: Tile, extraVisionRange: number, gameState: GameState): Tile[] {
   const tile = gameState.tiles.get(xy);
   const grid = getGrid(gameState);
   const building = tile?.building;
   if (!building || building.status === "building" || isNaturalWonder(building.type)) {
      return [];
   }
   const result: Set<Tile> = new Set();
   exploreTile(xy, gameState);
   result.add(xy);
   const visionRange = Config.Building[building.type]?.vision ?? BUILDING_DEFAULT_VISION + extraVisionRange;
   grid.getRange(tileToPoint(xy), visionRange).forEach((n) => {
      const xy = pointToTile(n);
      const tile = gameState.tiles.get(xy);
      if (tile && !tile.explored) {
         exploreTile(xy, gameState);
         result.add(xy);
      }
   });

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
