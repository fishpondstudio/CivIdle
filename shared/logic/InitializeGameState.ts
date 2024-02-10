import type { Grid } from "../utilities/Grid";
import { forEach, isEmpty, keysOf, pointToTile, shuffle } from "../utilities/Helper";
import { Config } from "./Config";
import { GameState } from "./GameState";
import { unlockTech } from "./TechLogic";
import { ensureTileFogOfWar, findNearest } from "./TerrainLogic";
import { makeBuilding } from "./Tile";

export function initializeGameState(gameState: GameState, grid: Grid) {
   const center = grid.center();
   const centerXy = pointToTile(center);

   grid.forEach((point) => {
      const xy = pointToTile(point);
      if (gameState.tiles.get(xy)) {
         return;
      }
      gameState.tiles.set(xy, {
         tile: xy,
         deposit: {},
         explored: false,
      });
   });

   gameState.tiles.get(centerXy)!.building = makeBuilding({
      type: "Headquarter",
      level: 1,
      status: "completed",
   });

   // forEach(Config.Tech, (k, v) => {
   //    if (v.column === 0) {
   //       unlockTech(k, getTechConfig(gameState), gameState);
   //    }
   // });
   forEach(Config.Tech, (k, v) => {
      if (v.column === 0) {
         unlockTech(k, null, gameState);
      }
   });

   const wood = findNearest((tile) => !!tile.deposit.Wood && !tile.building, center, grid, gameState);
   if (wood) {
      gameState.tiles.get(wood.tile)!.building = makeBuilding({
         type: "LoggingCamp",
         level: 1,
         status: "completed",
      });
   }

   const stone = findNearest((tile) => !!tile.deposit.Stone && !tile.building, center, grid, gameState);
   if (stone) {
      gameState.tiles.get(stone.tile)!.building = makeBuilding({
         type: "StoneQuarry",
         level: 1,
         status: "completed",
      });
   }

   const water = findNearest((tile) => !!tile.deposit.Water && !tile.building, center, grid, gameState);
   if (water) {
      gameState.tiles.get(water.tile)!.building = makeBuilding({
         type: "Aqueduct",
         level: 1,
         status: "completed",
      });
   }

   gameState.tiles.forEach((tile, xy) => {
      if (tile.building) {
         ensureTileFogOfWar(xy, gameState, grid);
      }
   });

   const naturalWonders = keysOf(Config.City[gameState.city].naturalWonders);
   const xys = shuffle(Array.from(gameState.tiles.keys()));
   for (let i = 0; i < xys.length; i++) {
      const xy = xys[i];
      const tile = gameState.tiles.get(xy)!;
      if (tile.building || !isEmpty(tile.deposit) || tile.explored) {
         continue;
      }
      if (naturalWonders.length <= 0) {
         break;
      }
      const naturalWonder = naturalWonders.pop()!;
      tile.building = makeBuilding({
         type: naturalWonder,
         level: 1,
         status: "completed",
      });
   }
}
