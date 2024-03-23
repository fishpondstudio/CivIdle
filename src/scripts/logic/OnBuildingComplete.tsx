import type { Deposit } from "../../../shared/definitions/ResourceDefinitions";
import {
   applyBuildingDefaults,
   exploreTile,
   getBuildingThatExtract,
   getExtraVisionRange,
   isNaturalWonder,
   isSpecialBuilding,
} from "../../../shared/logic/BuildingLogic";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import { getGrid, getXyBuildings } from "../../../shared/logic/IntraTickCache";
import { rollGreatPeopleThisRun } from "../../../shared/logic/RebornLogic";
import { getRevealedDeposits } from "../../../shared/logic/ResourceLogic";
import { OnResetTile, addDeposit } from "../../../shared/logic/TechLogic";
import { ensureTileFogOfWar } from "../../../shared/logic/TerrainLogic";
import { makeBuilding } from "../../../shared/logic/Tile";
import { OnBuildingComplete } from "../../../shared/logic/Update";
import {
   firstKeyOf,
   isEmpty,
   pointToTile,
   shuffle,
   sizeOf,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { WorldScene } from "../scenes/WorldScene";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { showModal } from "../ui/GlobalModal";
import { Singleton } from "../utilities/Singleton";
import { playLevelUp } from "../visuals/Sound";

export function onBuildingComplete(xy: Tile): void {
   const gs = getGameState();
   for (const g of ensureTileFogOfWar(xy, getExtraVisionRange(), gs)) {
      Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(g));
   }
   const building = gs.tiles.get(xy)?.building;
   if (!building) {
      return;
   }
   const grid = getGrid(gs);
   switch (building.type) {
      case "HatshepsutTemple": {
         gs.tiles.forEach((tile, xy) => {
            if (tile.deposit.Water) {
               exploreTile(xy, gs);
               Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(xy));
            }
         });
         break;
      }
      case "Parthenon": {
         const candidates1 = rollGreatPeopleThisRun("ClassicalAge", 4);
         if (candidates1) {
            gs.greatPeopleChoices.push(candidates1);
         }

         const candidates2 = rollGreatPeopleThisRun("ClassicalAge", 4);
         if (candidates2) {
            gs.greatPeopleChoices.push(candidates2);
         }

         if (gs.greatPeopleChoices.length > 0) {
            playLevelUp();
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
         break;
      }
      case "TajMahal": {
         const candidates1 = rollGreatPeopleThisRun("ClassicalAge");
         if (candidates1) {
            gs.greatPeopleChoices.push(candidates1);
         }

         const candidates2 = rollGreatPeopleThisRun("MiddleAge");
         if (candidates2) {
            gs.greatPeopleChoices.push(candidates2);
         }

         if (gs.greatPeopleChoices.length > 0) {
            playLevelUp();
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
         break;
      }
      case "StatueOfZeus": {
         let deposits: Deposit[] = [];
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            if (deposits.length <= 0) {
               deposits = shuffle(getRevealedDeposits(gs));
            }
            const neighborXy = pointToTile(neighbor);
            if (isEmpty(gs.tiles.get(neighborXy)!.deposit)) {
               const deposit = deposits.pop()!;
               addDeposit(neighborXy, deposit, OnResetTile, gs);
            }
         }
         break;
      }
      case "TempleOfArtemis": {
         getXyBuildings(gs).forEach((building) => {
            if (isSpecialBuilding(building.type)) {
               return;
            }
            if (building.type === "Armory" || building.type === "SwordForge") {
               building.level += 5;
            }
         });
         break;
      }
      case "GreatMosqueOfSamarra": {
         const unexploredDepositTiles: Tile[] = [];
         gs.tiles.forEach((tile, xy) => {
            if (!tile.explored && sizeOf(tile.deposit) > 0) {
               unexploredDepositTiles.push(xy);
            }
         });

         shuffle(unexploredDepositTiles);
         let count = 0;
         for (const xy of unexploredDepositTiles) {
            const tile = gs.tiles.get(xy);
            if (!tile) continue;
            const deposit = firstKeyOf(tile.deposit);
            if (!deposit) continue;
            const type = getBuildingThatExtract(deposit);
            if (!type) continue;

            tile.explored = true;
            tile.building = applyBuildingDefaults(
               makeBuilding({
                  type: type,
                  level: 10,
                  status: "completed",
               }),
               getGameOptions(),
            );
            OnBuildingComplete.emit(xy);
            ++count;

            if (count >= 5) break;
         }

         gs.tiles.forEach((tile, xy) => {
            if (
               tile.building &&
               tile.building.status !== "building" &&
               !isNaturalWonder(tile.building.type)
            ) {
               for (const g of ensureTileFogOfWar(xy, 1, gs)) {
                  Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(g));
               }
            }
         });
         break;
      }
   }
}
