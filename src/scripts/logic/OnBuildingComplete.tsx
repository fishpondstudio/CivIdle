import type { Deposit } from "../../../shared/definitions/ResourceDefinitions";
import { exploreTile, isSpecialBuilding } from "../../../shared/logic/BuildingLogic";
import { getGameState } from "../../../shared/logic/GameStateLogic";
import { getGrid, getXyBuildings } from "../../../shared/logic/IntraTickCache";
import { getRevealedDeposits } from "../../../shared/logic/ResourceLogic";
import { OnResetTile, addDeposit, getGreatPeopleChoices } from "../../../shared/logic/TechLogic";
import { ensureTileFogOfWar } from "../../../shared/logic/TerrainLogic";
import { isEmpty, pointToTile, shuffle, tileToPoint, type Tile } from "../../../shared/utilities/Helper";
import { WorldScene } from "../scenes/WorldScene";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { showModal } from "../ui/GlobalModal";
import { Singleton } from "../utilities/Singleton";

export function onBuildingComplete(xy: Tile): void {
   const gs = getGameState();
   for (const g of ensureTileFogOfWar(xy, gs, getGrid(gs))) {
      Singleton().sceneManager.getCurrent(WorldScene)?.getTile(g)?.reveal().catch(console.error);
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
               Singleton().sceneManager.getCurrent(WorldScene)?.getTile(xy)?.reveal().catch(console.error);
            }
         });
         break;
      }
      case "Parthenon": {
         const candidates = getGreatPeopleChoices("ClassicalAge");
         if (candidates) {
            gs.greatPeopleChoices.push(candidates);
         }
         if (gs.greatPeopleChoices.length > 0) {
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
         break;
      }
      case "TajMahal": {
         const candidates = getGreatPeopleChoices("MiddleAge");
         if (candidates) {
            gs.greatPeopleChoices.push(candidates);
         }
         if (gs.greatPeopleChoices.length > 0) {
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
   }
}
