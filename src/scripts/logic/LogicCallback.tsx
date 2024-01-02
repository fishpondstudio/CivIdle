import type { Deposit } from "../definitions/ResourceDefinitions";
import { WorldScene } from "../scenes/WorldScene";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { showModal } from "../ui/GlobalModal";
import {
   forEach,
   hasFlag,
   isEmpty,
   keysOf,
   pointToXy,
   safeAdd,
   safePush,
   shuffle,
   xyToPoint,
} from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
import { L, t } from "../utilities/i18n";
import {
   ST_PETERS_FAITH_MULTIPLIER,
   ST_PETERS_STORAGE_MULTIPLIER,
   exploreTile,
   getTotalBuildingUpgrades,
   isNaturalWonder,
   isSpecialBuilding,
   isWorldWonder,
} from "./BuildingLogic";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { getBuildingsByType, getTypeBuildings, getXyBuildings } from "./IntraTickCache";
import { getBuildingsThatProduce, getRevealedDeposits } from "./ResourceLogic";
import { addDeposit, getGreatPeopleChoices } from "./TechLogic";
import { ensureTileFogOfWar } from "./TerrainLogic";
import { Tick } from "./TickLogic";
import type { IPetraBuildingData } from "./Tile";
import { PetraOptions } from "./Tile";
import { addMultiplier } from "./Update";

export function onBuildingComplete(xy: string, gs: GameState) {
   for (const g of ensureTileFogOfWar(xy, gs, Singleton().grid)) {
      Singleton().sceneManager.getCurrent(WorldScene)?.getTile(g)?.reveal().catch(console.error);
   }
   const building = gs.tiles[xy].building;
   if (!building) {
      return;
   }
   const { grid } = Singleton();
   switch (building.type) {
      case "HatshepsutTemple": {
         forEach(gs.tiles, (xy, tile) => {
            if (tile.deposit.Water) {
               exploreTile(xy, gs);
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
      case "StatueOfZeus": {
         let deposits: Deposit[] = [];
         for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
            if (deposits.length <= 0) {
               deposits = shuffle(getRevealedDeposits(gs));
            }
            const neighborXy = pointToXy(neighbor);
            if (isEmpty(gs.tiles[neighborXy].deposit)) {
               const deposit = deposits.pop()!;
               addDeposit(neighborXy, deposit, gs);
            }
         }
         break;
      }
      case "TempleOfArtemis": {
         forEach(getXyBuildings(gs), (xy, building) => {
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

export function onTileExplored(xy: string, gs: GameState) {
   const building = gs.tiles[xy].building;
   if (isNaturalWonder(building?.type)) {
      switch (building?.type) {
         case "GrottaAzzurra": {
            forEach(getXyBuildings(gs), (xy, building) => {
               if (isSpecialBuilding(building.type)) {
                  return;
               }
               if (Config.BuildingTier[building.type] === 1) {
                  building.level += 5;
               }
            });
            break;
         }
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
   const buildingName = Config.Building[building.type].name();

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
      case "CircusMaximus": {
         addMultiplier("MusiciansGuild", { output: 1, storage: 1 }, buildingName);
         addMultiplier("PaintersGuild", { output: 1, storage: 1 }, buildingName);
         addMultiplier("WritersGuild", { output: 1, storage: 1 }, buildingName);
         Tick.next.globalMultipliers.happiness.push({ value: 5, source: buildingName });
         break;
      }
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
         forEach(Config.Building, (building, def) => {
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
            if (building && !Config.Building[building.type].output.Worker) {
               happiness++;
            }
         }
         Tick.next.globalMultipliers.happiness.push({ value: happiness, source: buildingName });
         break;
      }
      case "HagiaSophia": {
         if (!Tick.current.notProducingReasons[xy]) {
            Tick.next.globalMultipliers.happiness.push({
               value: Config.Building.HagiaSophia.input.Faith!,
               source: buildingName,
            });
         }
         break;
      }
      case "Colosseum": {
         if (!Tick.current.notProducingReasons[xy]) {
            Tick.next.globalMultipliers.happiness.push({
               value: Config.Building.Colosseum.input.Chariot!,
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
         forEach(Config.Building, (b, def) => {
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
         if (hasFlag(petra.petraOptions, PetraOptions.TimeWarp) && (petra.resources.Warp ?? 0) > 0) {
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
            Tick.next.notProducingReasons[xy] = "StorageFull";
         } else if (toProduce > 0) {
            delete Tick.next.notProducingReasons[xy];
         } else {
            Tick.next.notProducingReasons[xy] = "NotEnoughResources";
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
      case "Aphrodite": {
         forEach(getXyBuildings(gs), (xy, building) => {
            if (building.level >= 20 && building.status !== "completed") {
               safePush(Tick.next.tileMultipliers, xy, { worker: building.level - 20, source: buildingName });
            }
         });
         break;
      }
      case "Poseidon": {
         for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
            const neighborXy = pointToXy(neighbor);
            if (gs.tiles[neighborXy].building && gs.tiles[neighborXy].building!.level < 20) {
               gs.tiles[neighborXy].building!.level = 20;
            }
         }
         break;
      }
      case "StatueOfZeus": {
         for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
            const neighborXy = pointToXy(neighbor);
            const building = gs.tiles[neighborXy].building;
            if (building && Config.BuildingTier[building.type] === 1) {
               safePush(Tick.next.tileMultipliers, neighborXy, {
                  output: 5,
                  storage: 5,
                  source: buildingName,
               });
            }
         }
         break;
      }
      case "TempleOfArtemis": {
         addMultiplier("SwordForge", { worker: 1, storage: 1, output: 1 }, buildingName);
         addMultiplier("Armory", { worker: 1, storage: 1, output: 1 }, buildingName);
         break;
      }
      case "EiffelTower": {
         const neighborXys: string[] = [];
         let count = 0;
         for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
            const neighborXy = pointToXy(neighbor);
            const building = gs.tiles[neighborXy].building;
            if (building && building.type === "SteelMill") {
               neighborXys.push(neighborXy);
               ++count;
            }
         }
         for (const xy of neighborXys) {
            safePush(Tick.next.tileMultipliers, xy, {
               worker: count,
               storage: count,
               output: count,
               source: buildingName,
            });
         }
         break;
      }
      case "Rijksmuseum": {
         forEach(Config.Building, (b, def) => {
            if (def.input.Culture || def.output.Culture) {
               addMultiplier(b, { output: 1, worker: 1, storage: 1 }, buildingName);
            }
         });
         Tick.next.globalMultipliers.happiness.push({ value: 5, source: buildingName });
         break;
      }
      case "SummerPalace": {
         forEach(Config.Building, (b, def) => {
            if (def.input.Gunpowder || def.output.Gunpowder) {
               addMultiplier(b, { output: 1, worker: 1, storage: 1 }, buildingName);
            }
         });
         let count = 0;
         for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
            const neighborXy = pointToXy(neighbor);
            const b = gs.tiles[neighborXy].building;
            if (b && (Config.Building[b.type].input.Gunpowder || Config.Building[b.type].output.Gunpowder)) {
               ++count;
            }
         }
         Tick.next.globalMultipliers.happiness.push({ value: count, source: buildingName });
         break;
      }
      case "Neuschwanstein": {
         forEach(getXyBuildings(gs), (xy, building) => {
            if (isWorldWonder(building.type) && building.status === "building") {
               safePush(Tick.next.tileMultipliers, xy, { worker: 10, source: buildingName });
            }
         });
         break;
      }
      case "BrandenburgGate": {
         forEach(buildingsByType.OilRefinery, (xy, tile) => {
            if (tile.building) {
               let adjacentOilTiles = 0;
               for (const neighbor of grid.getNeighbors(xyToPoint(xy))) {
                  if (gs.tiles[pointToXy(neighbor)]?.deposit.Oil) {
                     ++adjacentOilTiles;
                  }
               }
               if (adjacentOilTiles > 0) {
                  safePush(Tick.next.tileMultipliers, tile.xy, {
                     output: adjacentOilTiles,
                     storage: adjacentOilTiles,
                     worker: adjacentOilTiles,
                     source: buildingName,
                  });
               }
            }
         });
         addMultiplier("OilWell", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("CoalMine", { output: 1, worker: 1, storage: 1 }, buildingName);
         break;
      }
      // case "ArcDeTriomphe": {
      //    forEach(Config.Building, (b, def) => {
      //       if (def.input.Culture || def.output.Culture) {
      //          addMultiplier(b, { output: 1, worker: 1, storage: 1 }, buildingName);
      //       }
      //    });
      //    break;
      // }
   }
}
