import { BuildingDefaultVisionRange } from "../definitions/BuildingDefinitions";
import { pointToTile, tileToPoint, type Tile } from "../utilities/Helper";
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
   const visionRange =
      Config.Building[building.type]?.vision ?? BuildingDefaultVisionRange + extraVisionRange;
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

export function sortByDistance(
   predicate: (tile: ITileData) => boolean,
   target: Tile,
   gs: GameState,
): ITileData[] {
   const grid = getGrid(gs);
   return Array.from(gs.tiles.values())
      .filter(predicate)
      .sort((a, b) => {
         return grid.distanceTile(a.tile, target) - grid.distanceTile(b.tile, target);
      });
}
