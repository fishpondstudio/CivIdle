import { forEach, isEmpty, keysOf, pointToTile, shuffle, tileToPoint } from "../utilities/Helper";
import { getServerNow } from "../utilities/ServerNow";
import { applyBuildingDefaults } from "./BuildingLogic";
import { Config } from "./Config";
import type { GameOptions, GameState } from "./GameState";
import { getGrid } from "./IntraTickCache";
import { unlockTech } from "./TechLogic";
import { ensureTileFogOfWar, findNearest } from "./TerrainLogic";
import { makeBuilding } from "./Tile";

export function initializeGameState(gameState: GameState, options: GameOptions) {
   const grid = getGrid(gameState);
   const center = grid.center();
   const centerXy = pointToTile(center);

   grid.forEach((point) => {
      const xy = pointToTile(point);
      if (gameState.tiles.has(xy)) {
         return;
      }
      gameState.tiles.set(xy, {
         tile: xy,
         deposit: {},
         explored: false,
      });
   });

   const opt = Object.assign({}, options, { defaultBuildingLevel: 1 });

   gameState.tiles.get(centerXy)!.building = applyBuildingDefaults(
      makeBuilding({
         type: "Headquarter",
         level: 1,
         status: "completed",
      }),
      opt,
   );

   // forEach(Config.Tech, (k, v) => {
   //    if (v.column === 0) {
   //       unlockTech(k, getTechConfig(gameState), gameState);
   //    }
   // });
   forEach(Config.Tech, (k, v) => {
      if (v.column === 0) {
         unlockTech(k, false, gameState);
      }
   });

   const wood = findNearest((tile) => !!tile.deposit.Wood && !tile.building, center, grid, gameState);
   if (wood) {
      gameState.tiles.get(wood.tile)!.building = applyBuildingDefaults(
         makeBuilding(
            makeBuilding({
               type: "LoggingCamp",
               level: 1,
               status: "completed",
            }),
         ),
         opt,
      );
   }

   const stone = findNearest((tile) => !!tile.deposit.Stone && !tile.building, center, grid, gameState);
   if (stone) {
      gameState.tiles.get(stone.tile)!.building = applyBuildingDefaults(
         makeBuilding({
            type: "StoneQuarry",
            level: 1,
            status: "completed",
         }),
         opt,
      );
   }

   const water = findNearest((tile) => !!tile.deposit.Water && !tile.building, center, grid, gameState);
   if (water) {
      gameState.tiles.get(water.tile)!.building = applyBuildingDefaults(
         makeBuilding({
            type: "Aqueduct",
            level: 1,
            status: "completed",
         }),
         opt,
      );
   }

   gameState.tiles.forEach((tile, xy) => {
      if (tile.building) {
         ensureTileFogOfWar(xy, 0, gameState);
      }
   });

   const naturalWonders = keysOf(Config.City[gameState.city].naturalWonders);

   const now = getServerNow();
   if (now && new Date(now).getMonth() === 11) {
      naturalWonders.push("Lapland");
      naturalWonders.push("RockefellerCenterChristmasTree");
   }

   const xys = shuffle(Array.from(gameState.tiles.keys()));
   for (let i = 0; i < xys.length; i++) {
      const xy = xys[i];
      const tile = gameState.tiles.get(xy)!;
      if (tile.building || !isEmpty(tile.deposit) || tile.explored || grid.isEdge(tileToPoint(xy), 2)) {
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
