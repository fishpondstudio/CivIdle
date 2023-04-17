import { IPointData } from "pixi.js";
import { City } from "../definitions/CityDefinitions";
import { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { Resource } from "../definitions/ResourceDefinitions";
import { PartialTabulate } from "../definitions/TypeDefinitions";
import { Grid } from "../scenes/Grid";
import { forEach, pointToXy } from "../utilities/Helper";
import { getTechTree, unlockTech } from "./TechLogic";
import { ensureTileFogOfWar, findNearest } from "./TerrainLogic";
import { ITileData, makeBuilding } from "./Tile";

interface ITransportationData {
   id: number;
   fromXy: string;
   toXy: string;
   position: IPointData;
   fromPosition: IPointData;
   toPosition: IPointData;
   resource: Resource;
   amount: number;
   hasEnoughFuel: boolean;
   fuel: Resource;
   fuelAmount: number;
}

export class GameState {
   city: City = "Rome";
   unlocked: Record<string, true> = {};
   tiles: Record<string, ITileData> = {};
   transportation: Record<string, ITransportationData[]> = {};
   tick = 0;
   greatPeople: PartialTabulate<GreatPerson> = {};
   greatPeopleChoices: GreatPeopleChoice[] = [];
   transportId = 0;
}

export type GreatPeopleChoice = [GreatPerson, GreatPerson, GreatPerson];

export class SavedGame {
   current = new GameState();
   options = new GameOptions();
}

export class GameOptions {
   useModernUI = true;
}

export function initializeGameState(gameState: GameState, grid: Grid) {
   const center = grid.center();
   const centerXy = pointToXy(center);

   grid.forEach((point) => {
      const xy = pointToXy(point);
      if (gameState.tiles[xy]) {
         return;
      }

      gameState.tiles[xy] = {
         xy,
         deposit: {},
         explored: false,
      };
   });

   gameState.tiles[centerXy].building = makeBuilding({
      type: "Headquarter",
      status: "completed",
   });

   // forEach(Config.Tech, (k, v) => {
   //    if (v.column === 0) {
   //       unlockTech(k, getTechConfig(gameState), gameState);
   //    }
   // });
   const techTree = getTechTree(gameState);
   forEach(techTree.definitions, (k, v) => {
      if (v.column === 0) {
         unlockTech(k, gameState);
      }
   });

   const wood = findNearest((tile) => !!tile.deposit.Wood, center, grid, gameState);
   if (wood) {
      gameState.tiles[wood.xy].building = makeBuilding({ type: "LoggingCamp", status: "completed" });
   }

   const stone = findNearest((tile) => !!tile.deposit.Stone, center, grid, gameState);
   if (stone) {
      gameState.tiles[stone.xy].building = makeBuilding({ type: "StoneQuarry", status: "completed" });
   }

   const water = findNearest((tile) => !!tile.deposit.Water, center, grid, gameState);
   if (water) {
      gameState.tiles[water.xy].building = makeBuilding({ type: "Aqueduct", status: "completed" });
   }

   // gameState.tiles[pointToXy({ x: center.x + 1, y: center.y + 1 })].building = makeBuilding({ type: "Hut" });

   // gameState.tiles[pointToXy({ x: center.x + 1, y: center.y })].building = makeBuilding({
   //     type: "Farmland",
   //     status: "completed",
   // });

   // gameState.tiles[pointToXy({ x: center.x + 4, y: center.y + 1 })].building = makeBuilding({
   //     type: "LivestockFarm",
   //     status: "completed",
   // });

   // gameState.tiles[pointToXy({ x: center.x + 5, y: center.y + 1 })].building = makeBuilding({
   //     type: "StonemasonsWorkshop",
   // });

   // const xy5 = pointToXy({ x: center.x + 5, y: center.y + 2 });
   // gameState.tiles[xy5].building = makeBuilding({ type: "StoneQuarry", status: "completed" });
   // gameState.tiles[xy5].deposit.Stone = true;

   // const xy6 = pointToXy({ x: center.x + 4, y: center.y + 2 });
   // gameState.tiles[xy6].building = makeBuilding({ type: "LoggingCamp" });
   // gameState.tiles[xy6].deposit.Wood = true;

   // const wonders = keysOf(gameState.currentTick.buildings).filter(
   //     (b) => gameState.currentTick.buildings[b].max === 1 && b !== "Headquarter"
   // );
   // const row = 6;
   // const col = wonders.length / row;
   // for (let x = 0; x < col; x++) {
   //     for (let y = 0; y < row; y++) {
   //         const building = wonders[y + x * row];
   //         if (!building) {
   //             break;
   //         }
   //         gameState.tiles[pointToXy({ x: center.x - 2 + x, y: center.y + 3 + y })].building = makeBuilding({
   //             type: building,
   //             status: "completed",
   //         });
   //     }
   // }

   forEach(gameState.tiles, (xy, tile) => {
      if (tile.building) {
         ensureTileFogOfWar(xy, gameState, grid);
      }
   });
}
