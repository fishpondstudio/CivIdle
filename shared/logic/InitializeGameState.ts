import { forEach, keysOf, pointToTile } from "../utilities/Helper";
import { getServerNow } from "../utilities/ServerNow";
import { applyBuildingDefaults, getRandomEmptyTiles } from "./BuildingLogic";
import { Config } from "./Config";
import type { GameOptions, GameState } from "./GameState";
import { getGrid } from "./IntraTickCache";
import { unlockTech } from "./TechLogic";
import { ensureTileFogOfWar, sortByDistance } from "./TerrainLogic";
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

   const wood = sortByDistance((tile) => !!tile.deposit.Wood && !tile.building, centerXy, gameState);
   if (wood.length > 0) {
      wood[0].building = applyBuildingDefaults(
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
   if (wood.length > 1) {
      wood[1].explored = true;
   }

   const stone = sortByDistance((tile) => !!tile.deposit.Stone && !tile.building, centerXy, gameState);
   if (stone.length > 0) {
      stone[0].building = applyBuildingDefaults(
         makeBuilding({
            type: "StoneQuarry",
            level: 1,
            status: "completed",
         }),
         opt,
      );
   }
   if (stone.length > 1) {
      stone[1].explored = true;
   }

   const water = sortByDistance((tile) => !!tile.deposit.Water && !tile.building, centerXy, gameState);
   if (water.length > 0) {
      water[0].building = applyBuildingDefaults(
         makeBuilding({
            type: "Aqueduct",
            level: 1,
            status: "completed",
         }),
         opt,
      );
   }
   if (water.length > 1) {
      water[1].explored = true;
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

   getRandomEmptyTiles(naturalWonders.length, gameState).forEach((xy, i) => {
      const tile = gameState.tiles.get(xy);
      if (tile) {
         tile.building = makeBuilding({
            type: naturalWonders[i],
            level: 1,
            status: "completed",
         });
      }
   });
}
