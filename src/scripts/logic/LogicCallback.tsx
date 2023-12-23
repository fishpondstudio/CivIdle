import { Tech } from "../definitions/TechDefinitions";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { showModal } from "../ui/GlobalModal";
import { forEach, keysOf, pointToXy, safeAdd, safePush, xyToPoint } from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
import { L, t } from "../utilities/i18n";
import {
   ST_PETERS_FAITH_MULTIPLIER,
   ST_PETERS_STORAGE_MULTIPLIER,
   getTotalBuildingUpgrades,
} from "./BuildingLogic";
import { GameState } from "./GameState";
import { getBuildingsByType, getTypeBuildings, getXyBuildings } from "./IntraTickCache";
import { getBuildingsThatProduce } from "./ResourceLogic";
import { getGreatPeopleChoices } from "./TechLogic";
import { ensureTileFogOfWar } from "./TerrainLogic";
import { Tick } from "./TickLogic";
import { IPetraBuildingData, PetraOptions } from "./Tile";
import { addMultiplier } from "./Update";

export function onBuildingComplete(xy: string, gs: GameState) {
   for (const g of ensureTileFogOfWar(xy, gs, Singleton().grid)) {
      Singleton().sceneManager.getCurrent(WorldScene)?.getTile(g)?.reveal().catch(console.error);
   }
   const building = gs.tiles[xy].building;

   if (!building) {
      return;
   }

   switch (building.type) {
      case "HatshepsutTemple": {
         forEach(gs.tiles, (xy, tile) => {
            if (tile.deposit.Water) {
               tile.explored = true;
               Singleton().sceneManager.getCurrent(WorldScene)?.getTile(xy)?.reveal().catch(console.error);
            }
         });
         break;
      }
      case "Parthenon": {
         gs.greatPeopleChoices.push(getGreatPeopleChoices("ClassicalAge"));
         if (gs.greatPeopleChoices.length > 0) {
            showModal(<ChooseGreatPersonModal greatPeopleChoice={gs.greatPeopleChoices[0]} />);
         }
         break;
      }
      case "TajMahal": {
         gs.greatPeopleChoices.push(getGreatPeopleChoices("MiddleAge"));
         if (gs.greatPeopleChoices.length > 0) {
            showModal(<ChooseGreatPersonModal greatPeopleChoice={gs.greatPeopleChoices[0]} />);
         }
         break;
      }
   }
}

export function onBuildingProductionComplete(xy: string, gs: GameState, offline: boolean) {
   const building = gs.tiles[xy].building;

   if (!building) {
      return;
   }

   const buildingsByType = getTypeBuildings(gs);

   const { grid } = Singleton();

   const buildingName = Tick.current.buildings[building.type].name();

   switch (building.type) {
      case "HatshepsutTemple": {
         forEach(buildingsByType.WheatFarm, (xy, tile) => {
            if (tile.building) {
               let adjacentWaterTiles = 0;
               for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
                  if (gs.tiles[pointToXy(neighbor)]?.deposit.Water) {
                     ++adjacentWaterTiles;
                  }
               }
               if (adjacentWaterTiles > 0) {
                  safePush(Tick.next.tileMultipliers, tile.xy, {
                     output: adjacentWaterTiles,
                     source: buildingName,
                  });
               }
            }
         });
         break;
      }
      // case "Colosseum": {
      //    grid.getNeighbors(xyToPoint(xy)).forEach((neighbor) => {
      //       safePush(Tick.next.tileMultipliers, pointToXy(neighbor), {
      //          output: 1,
      //          worker: 1,
      //          storage: 1,
      //          source: buildingName,
      //       });
      //    });
      //    break;
      // }
      // case "CircusMaximus": {
      //    forEach(Tick.current.buildings, (building, def) => {
      //       if (def.output.Worker) {
      //          addMultiplier(building, { output: 1 }, buildingName);
      //       }
      //    });
      //    break;
      // }
      case "Alps": {
         forEach(getXyBuildings(gs), (xy, building) => {
            const mul = Math.floor(building.level / 10);
            if (mul > 0) {
               safePush(Tick.next.tileMultipliers, xy, {
                  input: mul,
                  output: mul,
                  source: t(L.NaturalWonderName, { name: buildingName }),
               });
            }
         });
         break;
      }
      case "PyramidOfGiza": {
         forEach(Tick.current.buildings, (building, def) => {
            if (def.output.Worker) {
               addMultiplier(building, { output: 1 }, buildingName);
            }
         });
         break;
      }
      case "ChichenItza": {
         for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
            safePush(Tick.next.tileMultipliers, pointToXy(neighbor), {
               output: 1,
               storage: 1,
               worker: 1,
               source: buildingName,
            });
         }
         break;
      }
      case "LighthouseOfAlexandria": {
         for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
            safePush(Tick.next.tileMultipliers, pointToXy(neighbor), {
               storage: 5,
               source: buildingName,
            });
         }
         break;
      }
      case "ColossusOfRhodes": {
         let happiness = 0;
         for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
            const building = gs.tiles[pointToXy(neighbor)].building;
            if (building && !Tick.current.buildings[building.type].output.Worker) {
               happiness++;
            }
         }
         Tick.next.globalMultipliers.happiness.push({ value: happiness, source: buildingName });
         break;
      }
      case "HagiaSophia": {
         if (!Tick.current.notProducingReasons[xy]) {
            Tick.next.globalMultipliers.happiness.push({
               value: Tick.current.buildings.HagiaSophia.input.Faith!,
               source: buildingName,
            });
         }
         break;
      }
      case "AngkorWat": {
         safeAdd(Tick.next.workersAvailable, "Worker", 1000);
         for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
            safePush(Tick.next.tileMultipliers, pointToXy(neighbor), {
               worker: 1,
               source: buildingName,
            });
         }
         break;
      }
      case "TempleOfHeaven": {
         forEach(getXyBuildings(gs), (xy, building) => {
            if (building.level >= 10) {
               safePush(Tick.next.tileMultipliers, xy, {
                  worker: 1,
                  source: buildingName,
               });
            }
         });
         break;
      }
      case "LuxorTemple": {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: 1,
            source: buildingName,
         });
         break;
      }
      case "HangingGarden": {
         Tick.next.globalMultipliers.builderCapacity.push({
            value: 1,
            source: buildingName,
         });
         for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
            const building = gs.tiles[pointToXy(neighbor)].building;
            if (building && building.type === "Aqueduct") {
               safePush(Tick.next.tileMultipliers, pointToXy(neighbor), {
                  worker: 1,
                  storage: 1,
                  output: 1,
                  source: buildingName,
               });
            }
         }
         break;
      }
      case "Parthenon": {
         addMultiplier("MusiciansGuild", { worker: 1 }, buildingName);
         addMultiplier("PaintersGuild", { worker: 1 }, buildingName);
         break;
      }
      case "Stonehenge": {
         forEach(Tick.current.buildings, (b, def) => {
            if (def.input.Stone || def.output.Stone) {
               addMultiplier(b, { output: 1 }, buildingName);
            }
         });
         break;
      }
      case "TerracottaArmy": {
         addMultiplier(
            "IronMiningCamp",
            {
               output: 1,
               worker: 1,
               storage: 1,
            },
            buildingName,
         );
         forEach(buildingsByType.IronForge, (xy, tile) => {
            if (tile.building) {
               let adjacentIronMiningCamps = 0;
               for (const neighbor of grid.getNeighbors(xyToPoint(tile.xy))) {
                  if (gs.tiles[pointToXy(neighbor)]?.building?.type === "IronMiningCamp") {
                     ++adjacentIronMiningCamps;
                  }
               }
               if (adjacentIronMiningCamps > 0) {
                  safePush(Tick.next.tileMultipliers, tile.xy, {
                     output: adjacentIronMiningCamps,
                     source: buildingName,
                  });
               }
            }
         });
         break;
      }
      case "Persepolis": {
         addMultiplier("StoneQuarry", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("LoggingCamp", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("CopperMiningCamp", { output: 1, worker: 1, storage: 1 }, buildingName);
         break;
      }
      case "Petra": {
         if (offline) {
            break;
         }
         const petra = building as IPetraBuildingData;
         if (petra.petraOptions & PetraOptions.TimeWarp && (petra.resources.Warp ?? 0) > 0) {
            --petra.resources.Warp!;
            Singleton().ticker.speedUp = 2;
         } else {
            Singleton().ticker.speedUp = 1;
         }
         for (const res of keysOf(petra.resources)) {
            if (res !== "Warp") {
               delete petra.resources[res];
            }
         }
         break;
      }
      case "OxfordUniversity": {
         const upgrades = getTotalBuildingUpgrades(gs);
         safeAdd(Singleton().buildings.Headquarter.building.resources, "Science", upgrades);
         break;
      }
      case "StPetersBasilica": {
         let totalFaith = 0;
         let totalLevel = 0;
         getBuildingsThatProduce("Faith").forEach((b) => {
            addMultiplier(b, { storage: 1 }, buildingName);
            forEach(getBuildingsByType(b, gs), (xy, tile) => {
               if (tile.building.status === "completed") {
                  totalFaith += tile.building.resources.Faith ?? 0;
                  totalLevel += tile.building.level;
               }
            });
         });
         const toProduce = Math.floor(totalFaith * ST_PETERS_FAITH_MULTIPLIER);
         safeAdd(building.resources, "Faith", toProduce);
         const max = totalLevel * ST_PETERS_STORAGE_MULTIPLIER;
         if ((building.resources.Faith ?? 0) > max) {
            building.resources.Faith = max;
            Tick.current.notProducingReasons[xy] = "StorageFull";
         } else if (toProduce > 0) {
            delete Tick.current.notProducingReasons[xy];
         } else {
            Tick.current.notProducingReasons[xy] = "NotEnoughResources";
         }
         break;
      }
      case "ForbiddenCity": {
         addMultiplier("PaperMaker", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("WritersGuild", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("PrintingHouse", { output: 1, worker: 1, storage: 1 }, buildingName);
         break;
      }
      case "HimejiCastle": {
         addMultiplier("CaravelBuilder", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("GalleonBuilder", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("FrigateBuilder", { output: 1, worker: 1, storage: 1 }, buildingName);
         break;
      }
      case "TajMahal": {
         forEach(getXyBuildings(gs), (xy, building) => {
            if (building.level >= 20 && building.status !== "completed") {
               safePush(Tick.next.tileMultipliers, xy, { worker: 5, source: buildingName });
            }
         });
         break;
      }
   }
}

export function onTechUnlocked(tech: Tech, gs: GameState) {
   Singleton().sceneManager.getCurrent(TechTreeScene)?.renderTechTree("animate", true);
}
