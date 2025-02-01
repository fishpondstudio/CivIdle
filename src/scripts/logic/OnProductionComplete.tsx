import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { GreatPersonTickFlag, type GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import {
   forEachMultiplier,
   generateScienceFromFaith,
   getGreatWallRange,
   getMaxWarpStorage,
   getScienceFromWorkers,
   getWorkingBuilding,
   getYellowCraneTowerRange,
   isBuildingWellStocked,
   isSpecialBuilding,
   isWorldOrNaturalWonder,
   isWorldWonder,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import {
   EAST_INDIA_COMPANY_BOOST_PER_EV,
   EXPLORER_SECONDS,
   FESTIVAL_CONVERSION_RATE,
   MAX_EXPLORER,
   MAX_TELEPORT,
   SCIENCE_VALUE,
   TELEPORT_SECONDS,
   TOWER_BRIDGE_GP_PER_CYCLE,
} from "../../../shared/logic/Constants";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import {
   getBuildingsByType,
   getGrid,
   getTransportStat,
   getTypeBuildings,
   getXyBuildings,
} from "../../../shared/logic/IntraTickCache";
import { getVotedBoostId } from "../../../shared/logic/PlayerTradeLogic";
import {
   getGreatPeopleChoiceCount,
   getGreatPeopleForWisdom,
   getGreatPersonTotalEffect,
   getPermanentGreatPeopleLevel,
   rollGreatPeopleThisRun,
} from "../../../shared/logic/RebirthLogic";
import {
   getBuildingUnlockAge,
   getBuildingsUnlockedBefore,
   getCurrentAge,
   getUnlockedTechAges,
} from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import type {
   IGreatPeopleBuildingData,
   IIdeologyBuildingData,
   IReligionBuildingData,
   ITileData,
   ITraditionBuildingData,
   IZugspitzeBuildingData,
} from "../../../shared/logic/Tile";
import { addMultiplier, tickUnlockable } from "../../../shared/logic/Update";
import { VotedBoostType, type IGetVotedBoostResponse } from "../../../shared/utilities/Database";
import {
   MINUTE,
   clamp,
   forEach,
   keysOf,
   mapSafeAdd,
   mapSafePush,
   pointToTile,
   round,
   safeAdd,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { srand } from "../../../shared/utilities/Random";
import { L, t } from "../../../shared/utilities/i18n";
import { client } from "../rpc/RPCClient";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { hasOpenModal, showModal } from "../ui/GlobalModal";
import { Singleton } from "../utilities/Singleton";
import { playAgeUp } from "../visuals/Sound";

let votedBoost: IGetVotedBoostResponse | null = null;
let lastVotedBoostUpdatedAt = 0;
let lastFujiGeneratedAt = Date.now();
let fujiTick = 0;

export function onProductionComplete({ xy, offline }: { xy: Tile; offline: boolean }): void {
   const gs = getGameState();
   const options = getGameOptions();
   const building = gs.tiles.get(xy)?.building;
   if (!building) {
      return;
   }
   const buildingsByType = getTypeBuildings(gs);
   const grid = getGrid(gs);
   const buildingName = Config.Building[building.type].name();

   switch (building.type) {
      case "Headquarter": {
         mapSafePush(Tick.next.tileMultipliers, xy, {
            output: round(getPermanentGreatPeopleLevel(getGameOptions()) * 0.1, 1),
            source: t(L.PermanentGreatPeople),
         });
         if (hasFeature(GameFeature.Festival, gs)) {
            if (gs.festival) {
               if ((building.resources.Festival ?? 0) >= FESTIVAL_CONVERSION_RATE) {
                  safeAdd(building.resources, "Festival", -FESTIVAL_CONVERSION_RATE);
               } else {
                  gs.festival = false;
               }
            } else {
               const happiness = Tick.current.happiness?.value ?? 0;
               if (happiness > 0) {
                  safeAdd(building.resources, "Festival", happiness);
               }
            }
         } else {
            gs.festival = false;
         }

         if (!offline) {
            gs.speedUp = clamp(gs.speedUp, 1, getMaxWarpStorage(gs));
            if (gs.speedUp > 1 && (building.resources.Warp ?? 0) > 0) {
               --building.resources.Warp!;
            } else {
               gs.speedUp = 1;
            }
            Singleton().ticker.speedUp = gs.speedUp;
         }
         break;
      }
      case "HatshepsutTemple": {
         buildingsByType.get("WheatFarm")?.forEach((tile, xy) => {
            if (tile.building) {
               let adjacentWaterTiles = 0;
               for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
                  if (gs.tiles.get(pointToTile(neighbor))?.deposit.Water) {
                     ++adjacentWaterTiles;
                  }
               }
               if (adjacentWaterTiles > 0) {
                  mapSafePush(Tick.next.tileMultipliers, tile.tile, {
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
         getXyBuildings(gs).forEach((building, xy) => {
            const mul = Math.floor(building.level / 10);
            if (mul > 0) {
               mapSafePush(Tick.next.tileMultipliers, xy, {
                  input: gs.festival ? 0 : mul,
                  output: mul,
                  source: t(L.NaturalWonderName, { name: buildingName }),
               });
            }
         });
         break;
      }
      case "GrottaAzzurra": {
         forEach(Config.BuildingTier, (building, tier) => {
            if (tier === 1) {
               addMultiplier(building, { output: 1, worker: 1, storage: 1 }, buildingName);
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
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            mapSafePush(Tick.next.tileMultipliers, pointToTile(neighbor), {
               output: 1,
               storage: 1,
               worker: 1,
               source: buildingName,
            });
         }
         break;
      }
      case "LighthouseOfAlexandria": {
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            mapSafePush(Tick.next.tileMultipliers, pointToTile(neighbor), {
               storage: 5,
               source: buildingName,
            });
         }
         break;
      }
      case "GrandBazaar": {
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const xy = pointToTile(neighbor);
            const building = getWorkingBuilding(xy, gs);
            if (building?.type === "Caravansary") {
               mapSafePush(Tick.next.tileMultipliers, xy, {
                  output: 5,
                  storage: 5,
                  source: buildingName,
               });
            }
         }
         break;
      }
      case "ColossusOfRhodes": {
         let happiness = 0;
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const building = getWorkingBuilding(pointToTile(neighbor), gs);
            if (building && !Config.Building[building.type].output.Worker) {
               happiness++;
            }
         }
         Tick.next.globalMultipliers.happiness.push({ value: happiness, source: buildingName });
         break;
      }
      case "HagiaSophia": {
         let happiness = 5;
         const currentHappiness = Tick.current.happiness?.value ?? 0;
         if (Tick.current.tick <= 10 && currentHappiness < 0) {
            happiness += Math.abs(currentHappiness);
         }
         Tick.next.globalMultipliers.happiness.push({
            value: happiness,
            source: buildingName,
         });
         break;
      }
      case "Colosseum": {
         let happiness = (Config.TechAge[getCurrentAge(gs)].idx + 1) * 2;
         if (!Tick.current.notProducingReasons.has(xy)) {
            happiness += Config.Building.Colosseum.input.Chariot!;
         }
         Tick.next.globalMultipliers.happiness.push({
            value: happiness,
            source: buildingName,
         });
         getBuildingsByType("ChariotWorkshop", gs)?.forEach((tile, xy) => {
            Tick.next.happinessExemptions.add(xy);
         });
         break;
      }
      case "AngkorWat": {
         mapSafeAdd(Tick.next.workersAvailable, "Worker", 1000);
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            mapSafePush(Tick.next.tileMultipliers, pointToTile(neighbor), {
               worker: 1,
               source: buildingName,
            });
         }
         break;
      }
      case "TempleOfHeaven": {
         getXyBuildings(gs).forEach((building, xy) => {
            if (building.level >= 10) {
               mapSafePush(Tick.next.tileMultipliers, xy, {
                  worker: 1,
                  source: buildingName,
               });
            }
         });
         break;
      }
      case "HangingGarden": {
         let multiplier = 1;
         for (const point of getGrid(gs).getNeighbors(tileToPoint(xy))) {
            const neighbor = gs.tiles.get(pointToTile(point));
            if (neighbor?.explored && neighbor?.building?.type === "EuphratesRiver") {
               multiplier =
                  Config.TechAge[getCurrentAge(gs)].idx -
                  Config.TechAge[getBuildingUnlockAge("HangingGarden")].idx;
            }
         }
         Tick.next.globalMultipliers.builderCapacity.push({
            value: multiplier,
            source: buildingName,
         });
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const building = gs.tiles.get(pointToTile(neighbor))?.building;
            if (building && building.type === "Aqueduct") {
               mapSafePush(Tick.next.tileMultipliers, pointToTile(neighbor), {
                  worker: multiplier,
                  storage: multiplier,
                  output: multiplier,
                  source: buildingName,
               });
            }
         }
         break;
      }
      case "Parthenon": {
         addMultiplier("MusiciansGuild", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("PaintersGuild", { output: 1, worker: 1, storage: 1 }, buildingName);
         getBuildingsByType("MusiciansGuild", gs)?.forEach((tile, xy) => {
            Tick.next.happinessExemptions.add(xy);
         });
         getBuildingsByType("PaintersGuild", gs)?.forEach((tile, xy) => {
            Tick.next.happinessExemptions.add(xy);
         });
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
         buildingsByType.get("IronForge")?.forEach((tile, xy) => {
            if (tile.building) {
               let adjacentIronMiningCamps = 0;
               for (const neighbor of grid.getNeighbors(tileToPoint(tile.tile))) {
                  const neighborTile = gs.tiles.get(pointToTile(neighbor));
                  if (
                     neighborTile?.building?.type === "IronMiningCamp" &&
                     neighborTile.deposit.Iron &&
                     neighborTile.building.capacity > 0
                  ) {
                     ++adjacentIronMiningCamps;
                  }
               }
               if (adjacentIronMiningCamps > 0) {
                  mapSafePush(Tick.next.tileMultipliers, tile.tile, {
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
      case "OxfordUniversity": {
         let science = 0;
         Tick.current.scienceProduced.forEach((amount, tileXy) => {
            if (xy !== tileXy) {
               science += amount;
            }
         });
         science *= 0.1;

         const storage = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
         if (storage) {
            safeAdd(storage, "Science", science);
            mapSafeAdd(Tick.next.wonderProductions, "Science", science);
            Tick.next.scienceProduced.set(xy, science);
         }
         break;
      }
      case "ForbiddenCity": {
         addMultiplier("PaperMaker", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("WritersGuild", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("PrintingHouse", { output: 1, worker: 1, storage: 1 }, buildingName);
         break;
      }
      case "Statistics": {
         if (gs.tick % EXPLORER_SECONDS === 0 && (building.resources?.Explorer ?? 0) < MAX_EXPLORER) {
            safeAdd(building.resources, "Explorer", 1);
         }
         break;
      }
      case "HimejiCastle": {
         addMultiplier("CaravelBuilder", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("GalleonBuilder", { output: 1, worker: 1, storage: 1 }, buildingName);
         addMultiplier("FrigateBuilder", { output: 1, worker: 1, storage: 1 }, buildingName);
         break;
      }
      case "TajMahal": {
         getXyBuildings(gs).forEach((building, xy) => {
            if (building.level >= 20 && building.status !== "completed") {
               mapSafePush(Tick.next.tileMultipliers, xy, { worker: 5, source: buildingName });
            }
         });
         break;
      }
      case "SaintBasilsCathedral": {
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            const building = getWorkingBuilding(neighborXy, gs);
            if (building && Config.BuildingTier[building.type] === 1) {
               mapSafePush(Tick.next.tileMultipliers, neighborXy, {
                  output: 1,
                  worker: 1,
                  storage: 1,
                  source: buildingName,
               });
            }
         }
         break;
      }
      case "Aphrodite": {
         getXyBuildings(gs).forEach((building, xy) => {
            if (building.level >= 20 && building.status !== "completed") {
               mapSafePush(Tick.next.tileMultipliers, xy, {
                  worker: 2 * (building.level - 20),
                  source: buildingName,
               });
            }
         });
         forEach(options.greatPeople, (gp, inv) => {
            const def = Config.GreatPerson[gp];
            if (def.age === "ClassicalAge") {
               if (inv.level > 0) {
                  def.tick(def, 1, `${buildingName}: ${def.name()}`, GreatPersonTickFlag.Unstable);
               }
            }
         });
         break;
      }
      case "Poseidon": {
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            const building = getWorkingBuilding(neighborXy, gs);
            if (building && !isSpecialBuilding(building.type)) {
               if (building.level < 25) {
                  building.level = 25;
               }
               const tier = Config.BuildingTier[building.type] ?? 0;
               if (tier > 0) {
                  mapSafePush(Tick.next.tileMultipliers, neighborXy, {
                     output: tier,
                     storage: tier,
                     source: buildingName,
                  });
               }
            }
         }
         if (gs.festival) {
            Tick.next.globalMultipliers.output.push({ value: 1, source: buildingName });
         }
         break;
      }
      case "StatueOfZeus": {
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            const building = gs.tiles.get(neighborXy)?.building;
            if (building && Config.BuildingTier[building.type] === 1) {
               mapSafePush(Tick.next.tileMultipliers, neighborXy, {
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
         const neighborXys: Tile[] = [];
         let count = 0;
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            if (getWorkingBuilding(neighborXy, gs)?.type === "SteelMill") {
               neighborXys.push(neighborXy);
               ++count;
            }
         }
         for (const xy of neighborXys) {
            mapSafePush(Tick.next.tileMultipliers, xy, {
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
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            const b = getWorkingBuilding(neighborXy, gs);
            if (b && (Config.Building[b.type].input.Gunpowder || Config.Building[b.type].output.Gunpowder)) {
               Tick.next.happinessExemptions.add(neighborXy);
            }
         }
         break;
      }
      case "MogaoCaves": {
         const { workersAfterHappiness, workersBusy } = getScienceFromWorkers(gs);
         const fromBusyWorkers =
            workersAfterHappiness === 0 ? 0 : Math.floor((10 * workersBusy) / workersAfterHappiness);
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            const type = getWorkingBuilding(neighborXy, gs)?.type;
            if (type && Config.Building[type].output.Faith) {
               Tick.next.happinessExemptions.add(neighborXy);
            }
         }
         Tick.next.globalMultipliers.happiness.push({
            value: fromBusyWorkers,
            source: buildingName,
         });
         break;
      }
      case "Neuschwanstein": {
         getXyBuildings(gs).forEach((building, xy) => {
            if (isWorldWonder(building.type) && building.status !== "completed") {
               mapSafePush(Tick.next.tileMultipliers, xy, { worker: 10, source: buildingName });
            }
         });
         break;
      }
      case "StatueOfLiberty": {
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            const b = gs.tiles.get(neighborXy)?.building;
            if (b) {
               const type = b.type;
               let count = 0;
               for (const n of grid.getNeighbors(neighbor)) {
                  if (getWorkingBuilding(pointToTile(n), gs)?.type === type) {
                     ++count;
                  }
               }
               mapSafePush(Tick.next.tileMultipliers, neighborXy, {
                  worker: count,
                  storage: count,
                  output: count,
                  source: buildingName,
               });
            }
         }
         break;
      }
      case "BrandenburgGate": {
         buildingsByType.get("OilRefinery")?.forEach((tile, xy) => {
            if (tile.building) {
               let adjacentOilTiles = 0;
               for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
                  if (gs.tiles.get(pointToTile(neighbor))?.deposit.Oil) {
                     ++adjacentOilTiles;
                  }
               }
               if (adjacentOilTiles > 0) {
                  mapSafePush(Tick.next.tileMultipliers, tile.tile, {
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
      case "MountSinai": {
         forEach(Config.Building, (building, def) => {
            if (def.output.Faith) {
               addMultiplier(building, { storage: 5 }, buildingName);
            }
         });
         break;
      }
      case "NileRiver": {
         addMultiplier("WheatFarm", { output: 1, storage: 1 }, buildingName);
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            const building = getWorkingBuilding(neighborXy, gs);
            if (building?.type === "WheatFarm") {
               mapSafePush(Tick.next.tileMultipliers, neighborXy, {
                  storage: 5,
                  output: 5,
                  source: buildingName,
               });
            }
         }
         const total = getGreatPersonTotalEffect("Hatshepsut", gs);
         if (total > 0) {
            Config.GreatPerson.Hatshepsut.tick(
               Config.GreatPerson.Hatshepsut,
               total,
               `${buildingName}: ${Config.GreatPerson.Hatshepsut.name()}`,
               GreatPersonTickFlag.None,
            );
         }
         break;
      }
      case "AbuSimbel": {
         let count = 0;
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            if (isWorldWonder(getWorkingBuilding(neighborXy, gs)?.type)) {
               ++count;
            }
         }
         Tick.next.globalMultipliers.happiness.push({ value: count, source: buildingName });
         const total = getGreatPersonTotalEffect("RamessesII", gs);
         if (total > 0) {
            Tick.next.globalMultipliers.builderCapacity.push({
               value: Config.GreatPerson.RamessesII.value(total),
               source: buildingName,
            });
         }
         break;
      }
      case "GreatSphinx": {
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            const tileXy = pointToTile(point);
            const b = gs.tiles.get(tileXy)?.building;
            if (b && (Config.BuildingTier[b.type] ?? 0) > 1) {
               const type = b.type;
               let count = 0;
               for (const n of grid.getNeighbors(point)) {
                  if (getWorkingBuilding(pointToTile(n), gs)?.type === type) {
                     ++count;
                  }
               }
               mapSafePush(Tick.next.tileMultipliers, tileXy, {
                  input: gs.festival ? 0 : count,
                  output: count,
                  source: buildingName,
               });
            }
         }
         break;
      }
      case "Hollywood": {
         let count = 0;
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            const tileXy = pointToTile(point);
            const b = gs.tiles.get(tileXy)?.building;
            if (
               b &&
               isBuildingWellStocked(tileXy, gs) &&
               (Config.Building[b.type].input.Culture || Config.Building[b.type].output.Culture)
            ) {
               ++count;
            }
         }
         Tick.next.globalMultipliers.happiness.push({ value: count + 5, source: buildingName });
         break;
      }
      case "GoldenGateBridge": {
         forEach(Config.Building, (b, def) => {
            if (def.output.Power) {
               addMultiplier(b, { output: 1 }, buildingName);
            }
         });
         for (const point of grid.getNeighbors(tileToPoint(xy))) {
            Tick.next.powerPlants.add(pointToTile(point));
         }
         break;
      }
      case "CristoRedentor": {
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            Tick.next.happinessExemptions.add(pointToTile(point));
         }
         break;
      }
      case "SagradaFamilia": {
         const grid = getGrid(gs);
         let minTier = Number.MAX_SAFE_INTEGER;
         let maxTier = 0;
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            const building = getWorkingBuilding(neighborXy, gs)?.type;
            if (!building || isSpecialBuilding(building)) continue;
            const tier = Config.BuildingTier[building] ?? 0;
            if (tier <= 0) continue;
            minTier = Math.min(minTier, tier);
            maxTier = Math.max(maxTier, tier);
         }
         const diff = maxTier - minTier;
         if (diff > 0) {
            for (const point of grid.getRange(tileToPoint(xy), 2)) {
               mapSafePush(Tick.next.tileMultipliers, pointToTile(point), {
                  output: diff,
                  storage: diff,
                  worker: diff,
                  source: buildingName,
               });
            }
         }
         break;
      }
      case "YellowCraneTower": {
         for (const point of grid.getRange(tileToPoint(xy), getYellowCraneTowerRange(xy, gs))) {
            mapSafePush(Tick.next.tileMultipliers, pointToTile(point), {
               output: 1,
               storage: 1,
               worker: 1,
               source: buildingName,
            });
         }
         break;
      }
      case "UnitedNations": {
         forEach(Config.BuildingTier, (building, tier) => {
            if (tier >= 4 && tier <= 6) {
               addMultiplier(building, { output: 1, worker: 1, storage: 1 }, buildingName);
            }
         });

         // We update this every minute to reduce server load
         if (Date.now() - lastVotedBoostUpdatedAt > MINUTE) {
            lastVotedBoostUpdatedAt = Date.now();
            if (votedBoost === null || getVotedBoostId() !== votedBoost.id) {
               client.getVotedBoosts().then((resp) => {
                  votedBoost = resp;
               });
            }
         }

         if (votedBoost) {
            const current = votedBoost.current.options[votedBoost.current.voted];
            switch (current.type) {
               case VotedBoostType.Multipliers: {
                  current.buildings.forEach((b) => {
                     addMultiplier(b, { output: 5, storage: 5, worker: 5 }, buildingName);
                  });
                  break;
               }
            }
         }

         break;
      }
      case "MountTai": {
         forEach(Config.Building, (b, def) => {
            if (!isSpecialBuilding(b) && def.output.Science) {
               addMultiplier(b, { output: 1 }, buildingName);
            }
         });
         const total = getGreatPersonTotalEffect("Confucius", gs);
         if (total > 0) {
            Config.GreatPerson.Confucius.tick(
               Config.GreatPerson.Confucius,
               total,
               `${buildingName}: ${Config.GreatPerson.Confucius.name()}`,
               GreatPersonTickFlag.None,
            );
         }
         break;
      }
      case "ManhattanProject": {
         addMultiplier("UraniumMine", { output: 2, worker: 2, storage: 2 }, buildingName);
         const tick = (tile: Required<ITileData>, xy: Tile) => {
            if (!tile.building) return;
            let adjacentUraniumMines = 0;
            for (const point of grid.getNeighbors(tileToPoint(xy))) {
               const neighborTile = gs.tiles.get(pointToTile(point));
               if (
                  neighborTile?.building?.type === "UraniumMine" &&
                  neighborTile.building.status !== "building" &&
                  neighborTile.deposit.Uranium &&
                  neighborTile.building.capacity > 0
               ) {
                  ++adjacentUraniumMines;
               }
            }
            if (adjacentUraniumMines > 0) {
               mapSafePush(Tick.next.tileMultipliers, xy, {
                  output: adjacentUraniumMines,
                  source: buildingName,
               });
            }
         };
         buildingsByType.get("UraniumEnrichmentPlant")?.forEach(tick);
         buildingsByType.get("AtomicFacility")?.forEach(tick);
         // This is an easter egg :-)
         const amount = options.greatPeople.MahatmaGandhi?.amount ?? 0;
         if (amount > 0) {
            addMultiplier(
               "AtomicFacility",
               { storage: clamp(amount, 1, 5), output: clamp(amount, 1, 5) },
               Config.GreatPerson.MahatmaGandhi.name(),
            );
         }
         break;
      }
      case "GreatWall": {
         for (const point of grid.getRange(tileToPoint(xy), getGreatWallRange(xy, gs))) {
            const building = getWorkingBuilding(pointToTile(point), gs);
            if (!building || isSpecialBuilding(building.type)) continue;
            let count = Math.abs(
               Config.TechAge[getCurrentAge(gs)].idx -
                  Config.TechAge[getBuildingUnlockAge(building.type)].idx,
            );
            if (gs.festival) {
               count *= 2;
            }
            mapSafePush(Tick.next.tileMultipliers, pointToTile(point), {
               output: count,
               storage: count,
               worker: count,
               source: buildingName,
            });
         }
         break;
      }
      case "YangtzeRiver": {
         const level = getGameOptions().greatPeople.WuZetian?.level ?? 0;
         forEach(Config.Building, (b, def) => {
            if (def.input.Water) {
               addMultiplier(b, { output: 1, worker: 1, storage: 1 + level }, buildingName);
            } else if (level > 0) {
               addMultiplier(b, { storage: level }, buildingName);
            }
         });
         const total = getGreatPersonTotalEffect("ZhengHe", gs);
         if (total > 0) {
            Config.GreatPerson.ZhengHe.tick(
               Config.GreatPerson.ZhengHe,
               total,
               `${buildingName}: ${Config.GreatPerson.ZhengHe.name()}`,
               GreatPersonTickFlag.None,
            );
         }
         break;
      }
      case "PorcelainTower": {
         Tick.next.globalMultipliers.happiness.push({ value: 5, source: buildingName });
         if (gs.festival) {
            forEach(gs.greatPeople, (gp, level) => {
               if (level > 0) {
                  const def = Config.GreatPerson[gp];
                  def.tick(def, 1, `${t(L.Festival)}: ${def.name()}`, GreatPersonTickFlag.Unstable);
               }
            });
         }
         break;
      }
      case "Atomium": {
         let science = 0;
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            const nxy = pointToTile(point);
            if (nxy !== xy) {
               science += Tick.current.scienceProduced.get(nxy) ?? 0;
               const b = getWorkingBuilding(nxy, gs);
               if (b && Config.Building[b.type].output.Science) {
                  mapSafePush(Tick.next.tileMultipliers, nxy, { output: 5, source: buildingName });
               }
            }
         }
         const hq = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
         if (hq) {
            safeAdd(hq, "Science", science);
            mapSafeAdd(Tick.next.wonderProductions, "Science", science);
            Tick.next.scienceProduced.set(xy, science);
         }
         break;
      }
      case "CNTower": {
         getBuildingsByType("MovieStudio", gs)?.forEach((tile, xy) => {
            Tick.next.happinessExemptions.add(xy);
         });
         getBuildingsByType("RadioStation", gs)?.forEach((tile, xy) => {
            Tick.next.happinessExemptions.add(xy);
         });
         getBuildingsByType("TVStation", gs)?.forEach((tile, xy) => {
            Tick.next.happinessExemptions.add(xy);
         });
         forEach(Config.BuildingTechAge, (b, age) => {
            if (age === "WorldWarAge" || age === "ColdWarAge") {
               const m = Math.abs(Config.TechAge[age].idx + 1 - (Config.BuildingTier[b] ?? 1));
               addMultiplier(b, { output: m, storage: m, worker: m }, buildingName);
            }
         });
         break;
      }
      case "SpaceNeedle": {
         let happiness = 0;
         Tick.current.specialBuildings.forEach((xy, b) => {
            if (isWorldWonder(b)) {
               ++happiness;
            }
         });
         Tick.next.globalMultipliers.happiness.push({ value: happiness, source: buildingName });
         break;
      }
      case "ApolloProgram": {
         addMultiplier("RocketFactory", { output: 2, worker: 2, storage: 2 }, buildingName);
         const tick = (tile: Required<ITileData>, xy: Tile) => {
            if (!tile.building) return;
            let adjacent = 0;
            for (const point of grid.getNeighbors(tileToPoint(xy))) {
               const nxy = pointToTile(point);
               if (getWorkingBuilding(nxy, gs)?.type === "RocketFactory") {
                  ++adjacent;
               }
            }
            if (adjacent > 0) {
               mapSafePush(Tick.next.tileMultipliers, xy, { output: adjacent, source: buildingName });
            }
         };
         buildingsByType.get("SatelliteFactory")?.forEach(tick);
         buildingsByType.get("SpacecraftFactory")?.forEach(tick);
         buildingsByType.get("NuclearMissileSilo")?.forEach(tick);
         break;
      }
      case "ChoghaZanbil": {
         const cz = building as ITraditionBuildingData;
         if (cz.tradition) {
            const tradition = Config.Tradition[cz.tradition].content;
            for (let i = 0; i < cz.level; i++) {
               const trad = tradition[i];
               const def = Config.Upgrade[trad];
               if (!gs.unlockedUpgrades[trad]) {
                  gs.unlockedUpgrades[trad] = true;
                  def.onUnlocked?.(gs);
               }
               tickUnlockable(def, t(L.SourceTradition, { tradition: def.name() }), gs);
            }
         }
         break;
      }
      case "LuxorTemple": {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: 1,
            source: buildingName,
         });
         const lt = building as IReligionBuildingData;
         if (lt.religion) {
            const religion = Config.Religion[lt.religion].content;
            for (let i = 0; i < lt.level; i++) {
               const rel = religion[i];
               const def = Config.Upgrade[rel];
               if (!gs.unlockedUpgrades[rel]) {
                  gs.unlockedUpgrades[rel] = true;
                  def.onUnlocked?.(gs);
               }
               tickUnlockable(def, t(L.SourceReligion, { religion: def.name() }), gs);
            }
         }
         break;
      }
      case "BigBen": {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: 2,
            source: buildingName,
         });
         const bb = building as IIdeologyBuildingData;
         if (bb.ideology) {
            const ideology = Config.Ideology[bb.ideology].content;
            for (let i = 0; i < bb.level; i++) {
               const ideo = ideology[i];
               const def = Config.Upgrade[ideo];
               if (!gs.unlockedUpgrades[ideo]) {
                  gs.unlockedUpgrades[ideo] = true;
                  def.onUnlocked?.(gs);
               }
               tickUnlockable(def, t(L.SourceIdeology, { ideology: def.name() }), gs);
            }
         }
         break;
      }
      case "Broadway": {
         const broadway = building as IGreatPeopleBuildingData;
         broadway.greatPeople.forEach((gp) => {
            const def = Config.GreatPerson[gp];
            const total = getGreatPersonTotalEffect(gp, gs, options);
            if (total > 0) {
               def.tick(def, total, `${buildingName}: ${def.name()}`, GreatPersonTickFlag.Unstable);
            }
         });
         break;
      }
      case "TheMet": {
         if (gs.tick % TELEPORT_SECONDS === 0 && (building.resources?.Teleport ?? 0) < MAX_TELEPORT) {
            safeAdd(building.resources, "Teleport", 1);
         }
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            mapSafePush(Tick.next.tileMultipliers, pointToTile(point), {
               output: 1,
               worker: 1,
               storage: 1,
               source: buildingName,
            });
         }
         break;
      }
      case "WallStreet": {
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            const t = pointToTile(point);
            const b = gs.tiles.get(t)?.building;
            if (b && b.status === "completed") {
               let isValid = false;

               if (
                  Config.Building[b.type].output.Coin ||
                  Config.Building[b.type].output.Banknote ||
                  Config.Building[b.type].output.Bond ||
                  Config.Building[b.type].output.Stock ||
                  Config.Building[b.type].output.Forex
               ) {
                  isValid = true;
               }

               if (
                  gs.festival &&
                  (Config.Building[b.type].output.MutualFund ||
                     Config.Building[b.type].output.HedgeFund ||
                     Config.Building[b.type].output.Bitcoin)
               ) {
                  isValid = true;
               }

               if (isValid) {
                  let multiplier = Math.round(srand(gs.id + gs.lastPriceUpdated + t)() * 4 + 1);
                  if (gs.festival) {
                     multiplier *= 2;
                  }
                  mapSafePush(Tick.next.tileMultipliers, t, {
                     unstable: true,
                     output: multiplier,
                     source: buildingName,
                  });
               }
            }
         }

         if (gs.festival) {
            addMultiplier("ResearchFund", { output: 5 }, buildingName);
         }

         const total = getGreatPersonTotalEffect("JohnDRockefeller", gs, options);
         if (total > 0) {
            Config.GreatPerson.JohnDRockefeller.tick(
               Config.GreatPerson.JohnDRockefeller,
               total,
               `${buildingName}: ${Config.GreatPerson.JohnDRockefeller.name()}`,
               GreatPersonTickFlag.None,
            );
         }
         break;
      }
      case "Shenandoah": {
         const currentAge = getCurrentAge(gs);
         forEach(Config.BuildingTechAge, (building, age) => {
            if (age === currentAge) {
               addMultiplier(building, { output: 2, unstable: true }, buildingName);
            }
         });
         const total = getGreatPersonTotalEffect("JPMorgan", gs, options);
         if (total > 0) {
            Config.GreatPerson.JPMorgan.tick(
               Config.GreatPerson.JPMorgan,
               total,
               `${buildingName}: ${Config.GreatPerson.JPMorgan.name()}`,
               GreatPersonTickFlag.None,
            );
         }
         break;
      }
      case "NiagaraFalls": {
         const currentAge = getCurrentAge(gs);
         const count = Config.TechAge[currentAge].idx + 1;
         addMultiplier("Warehouse", { storage: count }, buildingName);
         addMultiplier("Market", { storage: count }, buildingName);
         addMultiplier("Caravansary", { storage: count }, buildingName);
         const total =
            getGreatPersonTotalEffect("AlbertEinstein", gs, options) +
            (options.ageWisdom[Config.GreatPerson.AlbertEinstein.age] ?? 0);
         if (total > 0) {
            addMultiplier("ResearchFund", { output: total }, buildingName);
         }
         break;
      }
      case "StPetersBasilica": {
         addMultiplier("Church", { storage: 5 }, buildingName);
         generateScienceFromFaith(xy, "Church", gs);
         break;
      }
      case "ProphetsMosque": {
         Config.GreatPerson.HarunAlRashid.tick(
            Config.GreatPerson.HarunAlRashid,
            getGreatPersonTotalEffect("HarunAlRashid", gs, options),
            `${buildingName}: ${Config.GreatPerson.HarunAlRashid.name()}`,
            GreatPersonTickFlag.None,
         );
         generateScienceFromFaith(xy, "Mosque", gs);
         break;
      }
      case "GreatDagonPagoda": {
         getBuildingsByType("Pagoda", gs)?.forEach((tile, xy) => {
            Tick.next.happinessExemptions.add(xy);
         });
         generateScienceFromFaith(xy, "Pagoda", gs);
         break;
      }
      case "Pantheon": {
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            const tileXy = pointToTile(point);
            mapSafePush(Tick.next.tileMultipliers, tileXy, {
               worker: 1,
               storage: 1,
               source: buildingName,
            });
         }
         generateScienceFromFaith(xy, "Shrine", gs);
         break;
      }
      case "ZigguratOfUr": {
         const happiness = Tick.current.happiness?.value ?? 0;
         const age = getCurrentAge(gs);
         if (happiness > 0) {
            const multiplier = clamp(
               Math.floor(happiness / 10),
               1,
               Math.floor((Config.TechAge[age].idx + 1) / 2),
            );
            const candidates = gs.festival
               ? keysOf(Config.BuildingTechAge)
               : getBuildingsUnlockedBefore(getCurrentAge(gs));
            candidates.forEach((b) => {
               if (!isSpecialBuilding(b) && !Config.Building[b].output.Worker) {
                  addMultiplier(b, { output: multiplier, unstable: true }, buildingName);
               }
            });
         }
         break;
      }
      case "TowerOfBabel": {
         const buildings = new Set<Building>();
         for (const point of grid.getRange(tileToPoint(xy), 1)) {
            const tileXy = pointToTile(point);
            const building = getWorkingBuilding(tileXy, gs);
            if (building && !Tick.current.notProducingReasons.has(tileXy)) {
               buildings.add(building.type);
            }
         }
         buildings.forEach((b) => {
            addMultiplier(b, { output: 2, unstable: true }, buildingName);
         });
         break;
      }
      case "WallOfBabylon": {
         const age = getCurrentAge(gs);
         Tick.next.globalMultipliers.storage.push({
            value: Math.floor((Config.TechAge[age].idx + 1) / 2),
            source: buildingName,
         });
         break;
      }
      case "ZagrosMountains": {
         for (const point of grid.getRange(tileToPoint(xy), 1)) {
            const tileXy = pointToTile(point);
            // Include base multiplier (1)
            let multiplier = 1;
            forEachMultiplier(
               tileXy,
               (m) => {
                  if (m.output && m.source !== buildingName) {
                     multiplier += m.output;
                  }
               },
               false,
               gs,
            );
            if (multiplier < 5) {
               mapSafePush(Tick.next.tileMultipliers, tileXy, {
                  output: 2,
                  unstable: true,
                  source: buildingName,
               });
            }
         }
         const total = getGreatPersonTotalEffect("NebuchadnezzarII", gs, options);
         if (total > 0) {
            Config.GreatPerson.NebuchadnezzarII.tick(
               Config.GreatPerson.NebuchadnezzarII,
               total,
               `${buildingName}: ${Config.GreatPerson.NebuchadnezzarII.name()}`,
               GreatPersonTickFlag.None,
            );
         }
         break;
      }
      case "EuphratesRiver": {
         const stat = getTransportStat(gs);
         const productionWorkers = (Tick.current.workersUsed.get("Worker") ?? 0) - stat.totalFuel;
         const totalWorkers =
            (Tick.current.workersAvailable.get("Worker") ?? 0) *
            (Tick.current.happiness?.workerPercentage ?? 0);
         const multiplier = Math.floor((productionWorkers * 10) / totalWorkers);
         const age = getCurrentAge(gs);
         if (Number.isFinite(multiplier) && multiplier > 0) {
            const cappedMultiplier = clamp(multiplier, 1, Math.floor((Config.TechAge[age].idx + 1) / 2));
            const candidates = gs.festival
               ? keysOf(Config.BuildingTechAge)
               : getBuildingsUnlockedBefore(getCurrentAge(gs));
            candidates.forEach((b) => {
               if (!isSpecialBuilding(b) && !Config.Building[b].output.Worker) {
                  addMultiplier(b, { output: cappedMultiplier, unstable: true }, buildingName);
               }
            });
         }
         break;
      }
      case "InternationalSpaceStation": {
         Tick.next.globalMultipliers.storage.push({
            value: 5 + (building.level - 1),
            source: buildingName,
         });
         break;
      }
      case "MarinaBaySands": {
         Tick.next.globalMultipliers.worker.push({
            value: 5 + 1 * (building.level - 1),
            source: buildingName,
         });
         break;
      }
      case "PalmJumeirah": {
         Tick.next.globalMultipliers.builderCapacity.push({
            value: 10 + 2 * (building.level - 1),
            source: buildingName,
         });
         break;
      }
      case "AldersonDisk": {
         Tick.next.globalMultipliers.happiness.push({
            value: 25 + 5 * (building.level - 1),
            source: buildingName,
         });
         break;
      }
      case "DysonSphere": {
         Tick.next.globalMultipliers.output.push({
            value: 5 + 1 * (building.level - 1),
            source: buildingName,
         });
         break;
      }
      case "MatrioshkaBrain": {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: 5 + 1 * (building.level - 1),
            source: buildingName,
         });
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: 5 + 1 * (building.level - 1),
            source: buildingName,
         });
         const hq = Tick.current.specialBuildings.get("Headquarter");
         if (hq) {
            const scienceValue = (hq.building.resources?.Science ?? 0) * SCIENCE_VALUE;
            Tick.next.totalValue += scienceValue;
            mapSafeAdd(Tick.next.resourceValueByTile, xy, scienceValue);
            mapSafeAdd(Tick.next.resourceValues, "Science", scienceValue);
         }
         if (building.level > 1) {
            forEach(Config.Building, (b, def) => {
               if (def.output.Science) {
                  addMultiplier(b, { output: building.level - 1 }, buildingName);
               }
            });
         }
         break;
      }
      case "LargeHadronCollider": {
         const level = 2 + building.level - 1;
         forEach(Config.GreatPerson, (p, def) => {
            if (def.age === "InformationAge") {
               def.tick(def, level, `${buildingName}: ${def.name()}`, GreatPersonTickFlag.None);
            }
         });
         break;
      }
      case "OsakaCastle": {
         for (const point of grid.getRange(tileToPoint(xy), 1)) {
            Tick.next.powerPlants.add(pointToTile(point));
         }
         break;
      }
      case "Kanagawa": {
         const currentAge = getCurrentAge(gs);
         forEach(Config.GreatPerson, (p, def) => {
            if (def.age === currentAge) {
               def.tick(def, 1, `${buildingName}: ${def.name()}`, GreatPersonTickFlag.Unstable);
            }
         });
         break;
      }
      case "MountFuji": {
         const interval = Math.min(fujiTick, (Date.now() - lastFujiGeneratedAt) / 1000);
         if (interval >= 60) {
            fujiTick = 0;
            lastFujiGeneratedAt = Date.now();
            const petra = Tick.current.specialBuildings.get("Petra");
            const hq = Tick.current.specialBuildings.get("Headquarter");
            if (hq && petra) {
               const total = getMaxWarpStorage(gs);
               const amount = gs.festival ? 40 : 20;
               if (total - (hq.building.resources.Warp ?? 0) >= amount) {
                  safeAdd(hq.building.resources, "Warp", amount);
               }
            }
         } else {
            fujiTick++;
         }
         break;
      }
      case "GoldenPavilion": {
         grid.getRange(tileToPoint(xy), 3).forEach((point) => {
            const tile = pointToTile(point);
            const building = gs.tiles.get(tile)?.building;
            if (!building) {
               return;
            }
            const input = Config.Building[building.type].input;
            let multiplier = 0;
            grid.getNeighbors(point).forEach((p) => {
               const building = gs.tiles.get(pointToTile(p))?.building;
               if (!building || building.capacity <= 0) {
                  return;
               }
               forEach(Config.Building[building.type].output, (res) => {
                  if (input[res]) {
                     ++multiplier;
                     // break
                     return true;
                  }
               });
            });
            mapSafePush(Tick.next.tileMultipliers, tile, {
               output: multiplier,
               unstable: true,
               source: buildingName,
            });
         });
         break;
      }
      case "RhineGorge": {
         let count = 0;
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            const targetXy = pointToTile(point);
            if (targetXy === xy) {
               continue;
            }
            const building = gs.tiles.get(targetXy)?.building;
            if (building?.status === "completed" && isWorldOrNaturalWonder(building.type)) {
               ++count;
            }
         }
         Tick.next.globalMultipliers.happiness.push({ value: count * 2, source: buildingName });
         break;
      }
      case "Elbphilharmonie": {
         for (const point of grid.getRange(tileToPoint(xy), 3)) {
            const xy = pointToTile(point);
            const building = getWorkingBuilding(xy, gs);
            if (!building) {
               continue;
            }
            let count = 0;
            for (const point2 of grid.getNeighbors(point)) {
               const building2 = getWorkingBuilding(pointToTile(point2), gs);
               if (!building2) {
                  continue;
               }
               if (
                  !isSpecialBuilding(building2.type) &&
                  Config.BuildingTier[building.type] !== Config.BuildingTier[building2.type]
               ) {
                  ++count;
               }
            }
            mapSafePush(Tick.next.tileMultipliers, xy, {
               output: count,
               source: buildingName,
            });
         }
         break;
      }
      case "CologneCathedral": {
         forEach(Config.Building, (b, def) => {
            if (!isSpecialBuilding(b) && def.output.Science) {
               addMultiplier(b, { output: building.level }, buildingName);
            }
         });
         break;
      }
      case "BlackForest": {
         forEach(Config.Building, (b, def) => {
            if (!isSpecialBuilding(b) && (def.input.Wood || def.input.Lumber)) {
               addMultiplier(b, { output: 5 }, buildingName);
            }
         });
         break;
      }
      case "Zugspitze": {
         const zug = building as IZugspitzeBuildingData;
         const gps = new Map<GreatPerson, number>();
         const currentAge = getCurrentAge(gs);
         zug.greatPeople.forEach((gp, age) => {
            if (Config.TechAge[age].idx <= Config.TechAge[currentAge].idx) {
               mapSafeAdd<GreatPerson>(gps, gp, 1);
            }
         });
         gps.forEach((level, gp) => {
            const def = Config.GreatPerson[gp];
            def.tick(
               def,
               gs.festival ? level * 2 : level,
               `${buildingName}: ${def.name()}`,
               GreatPersonTickFlag.Unstable,
            );
         });
         break;
      }
      case "Lapland": {
         const multiplier = Config.TechAge[getCurrentAge(gs)].idx + 1;
         for (const neighbor of grid.getRange(tileToPoint(xy), 2)) {
            mapSafePush(Tick.next.tileMultipliers, pointToTile(neighbor), {
               output: multiplier,
               source: buildingName,
            });
         }
         break;
      }
      case "RockefellerCenterChristmasTree": {
         const multiplier = Config.TechAge[getCurrentAge(gs)].idx + 1;
         Tick.next.globalMultipliers.happiness.push({ value: multiplier * 3, source: buildingName });
         break;
      }
      case "YearOfTheSnake": {
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            mapSafePush(Tick.next.tileMultipliers, pointToTile(point), {
               output: building.level,
               source: buildingName,
            });
         }
         break;
      }
      case "CambridgeUniversity": {
         forEach(Config.TechAge, (age, def) => {
            if (def.idx < Config.TechAge.RenaissanceAge.idx) {
               return;
            }
            getGreatPeopleForWisdom(age).forEach((gp) => {
               const greatPerson = Config.GreatPerson[gp];
               greatPerson.tick(
                  greatPerson,
                  1,
                  t(L.CambridgeUniversitySource, { age: Config.TechAge[age].name() }),
                  GreatPersonTickFlag.None,
               );
            });
         });
         break;
      }
      case "TowerBridge": {
         safeAdd(building.resources, "Cycle", gs.festival ? 1.2 : 1);
         let hasGreatPeople = false;
         while ((building.resources.Cycle ?? 0) >= TOWER_BRIDGE_GP_PER_CYCLE) {
            safeAdd(building.resources, "Cycle", -TOWER_BRIDGE_GP_PER_CYCLE);
            const candidates1 = rollGreatPeopleThisRun(
               getUnlockedTechAges(gs),
               gs.city,
               getGreatPeopleChoiceCount(gs),
            );
            if (candidates1) {
               gs.greatPeopleChoicesV2.push(candidates1);
               hasGreatPeople = true;
            }
         }
         if (hasGreatPeople && !hasOpenModal()) {
            playAgeUp();
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
         break;
      }
      case "EastIndiaCompany": {
         if ((building.resources.TradeValue ?? 0) > EAST_INDIA_COMPANY_BOOST_PER_EV) {
            safeAdd(building.resources, "TradeValue", -EAST_INDIA_COMPANY_BOOST_PER_EV);
            getBuildingsByType("Caravansary", gs)?.forEach((tile, xy) => {
               grid.getNeighbors(tileToPoint(xy)).forEach((p) => {
                  mapSafePush(Tick.next.tileMultipliers, pointToTile(p), {
                     output: gs.festival ? 2 : 1,
                     source: buildingName,
                     unstable: true,
                  });
               });
            });
         }
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
