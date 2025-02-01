import type { Deposit } from "../../../shared/definitions/ResourceDefinitions";
import {
   applyBuildingDefaults,
   exploreTile,
   getBuildingThatExtract,
   getExtraVisionRange,
   isNaturalWonder,
   isWorldWonder,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import { getGrid, getXyBuildings } from "../../../shared/logic/IntraTickCache";
import {
   getGreatPeopleChoiceCount,
   getRebirthGreatPeopleCount,
   rollGreatPeopleThisRun,
   rollPermanentGreatPeople,
} from "../../../shared/logic/RebirthLogic";
import { getRevealedDeposits } from "../../../shared/logic/ResourceLogic";
import {
   addDeposit,
   getCurrentAge,
   getMostAdvancedTech,
   getTechUnlockCost,
   getTechUnlockCostInAge,
} from "../../../shared/logic/TechLogic";
import { ensureTileFogOfWar } from "../../../shared/logic/TerrainLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { makeBuilding, type IBuildingData } from "../../../shared/logic/Tile";
import { OnBuildingComplete } from "../../../shared/logic/Update";
import {
   clamp,
   filterOf,
   firstKeyOf,
   isEmpty,
   pointToTile,
   safeAdd,
   shuffle,
   sizeOf,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { WorldScene } from "../scenes/WorldScene";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { showModal } from "../ui/GlobalModal";
import { Singleton } from "../utilities/Singleton";
import { playAgeUp } from "../visuals/Sound";

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
         const candidates1 = rollGreatPeopleThisRun(new Set(["ClassicalAge"]), gs.city, 4);
         if (candidates1) {
            gs.greatPeopleChoicesV2.push(candidates1);
         }

         const candidates2 = rollGreatPeopleThisRun(new Set(["ClassicalAge"]), gs.city, 4);
         if (candidates2) {
            gs.greatPeopleChoicesV2.push(candidates2);
         }

         if (gs.greatPeopleChoicesV2.length > 0) {
            playAgeUp();
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
         break;
      }
      case "TajMahal": {
         const candidates1 = rollGreatPeopleThisRun(
            new Set(["ClassicalAge"]),
            gs.city,
            getGreatPeopleChoiceCount(gs),
         );
         if (candidates1) {
            gs.greatPeopleChoicesV2.push(candidates1);
         }

         const candidates2 = rollGreatPeopleThisRun(
            new Set(["MiddleAge"]),
            gs.city,
            getGreatPeopleChoiceCount(gs),
         );
         if (candidates2) {
            gs.greatPeopleChoicesV2.push(candidates2);
         }

         if (gs.greatPeopleChoicesV2.length > 0) {
            playAgeUp();
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
         break;
      }
      case "OxfordUniversity":
      case "Atomium": {
         const tech = getMostAdvancedTech(gs);
         const hq = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
         if (tech && hq) {
            safeAdd(hq, "Science", getTechUnlockCost(tech));
         }
         break;
      }
      case "CologneCathedral": {
         const age = getCurrentAge(gs);
         const [_, max] = getTechUnlockCostInAge(age);
         const hq = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
         if (hq) {
            safeAdd(hq, "Science", max);
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
               addDeposit(neighborXy, deposit, true, gs);
            }
         }
         break;
      }
      case "TempleOfArtemis": {
         getXyBuildings(gs).forEach((building) => {
            if (building.status !== "completed") {
               return;
            }
            if (building.type === "Armory" || building.type === "SwordForge") {
               building.level += 5;
            }
         });
         break;
      }
      case "PorcelainTower": {
         if (gs.claimedGreatPeople > 0) {
            return;
         }
         gs.claimedGreatPeople = getRebirthGreatPeopleCount();
         let pickPerRoll = 1;
         const choiceCount = getGreatPeopleChoiceCount(gs);
         if (getGameOptions().porcelainTowerMaxPickPerRoll) {
            pickPerRoll = clamp(Math.floor(gs.claimedGreatPeople / 50), 1, Number.POSITIVE_INFINITY);
         }
         rollPermanentGreatPeople(
            gs.claimedGreatPeople,
            pickPerRoll,
            choiceCount,
            getCurrentAge(gs),
            gs.city,
         ).forEach((c) => gs.greatPeopleChoicesV2.push(c));
         if (gs.greatPeopleChoicesV2.length > 0) {
            playAgeUp();
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
         break;
      }
      case "GrandBazaar": {
         gs.lastPriceUpdated = 0;
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
      case "Broadway": {
         const age = getCurrentAge(gs);
         const candidates1 = rollGreatPeopleThisRun(new Set([age]), gs.city, getGreatPeopleChoiceCount(gs));
         if (candidates1) {
            gs.greatPeopleChoicesV2.push(candidates1);
         }

         const previousAge = firstKeyOf(
            filterOf(Config.TechAge, (k, v) => v.idx === Config.TechAge[age].idx - 1),
         );

         if (previousAge) {
            const candidates2 = rollGreatPeopleThisRun(
               new Set([previousAge]),
               gs.city,
               getGreatPeopleChoiceCount(gs),
            );
            if (candidates2) {
               gs.greatPeopleChoicesV2.push(candidates2);
            }
         }

         if (gs.greatPeopleChoicesV2.length > 0) {
            playAgeUp();
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
         break;
      }
      case "BritishMuseum": {
         gs.unlockedUpgrades.BritishMuseum = true;
         break;
      }
   }
   checkCerneAbbasGiant(building, gs);
}

function checkCerneAbbasGiant(building: IBuildingData, gs: GameState) {
   if (Tick.current.specialBuildings.has("CerneAbbasGiant") && isWorldWonder(building.type)) {
      const candidates = rollGreatPeopleThisRun(
         new Set([getCurrentAge(gs)]),
         gs.city,
         getGreatPeopleChoiceCount(gs),
      );
      if (candidates) {
         gs.greatPeopleChoicesV2.push(candidates);
      }
      if (gs.greatPeopleChoicesV2.length > 0) {
         playAgeUp();
         showModal(<ChooseGreatPersonModal permanent={false} />);
      }
   }
}
