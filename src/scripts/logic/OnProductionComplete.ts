import { tickGreatPersonBoost } from "../../../shared/definitions/GreatPersonDefinitions";
import {
   ST_PETERS_FAITH_MULTIPLIER,
   ST_PETERS_STORAGE_MULTIPLIER,
   getCompletedBuilding,
   getScienceFromWorkers,
   getTotalBuildingUpgrades,
   isBuildingWellStocked,
   isSpecialBuilding,
   isWorldWonder,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { EXPLORER_SECONDS, MAX_EXPLORER, OXFORD_SCIENCE_PER_UPGRADE } from "../../../shared/logic/Constants";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import {
   getBuildingsByType,
   getGrid,
   getSpecialBuildings,
   getTypeBuildings,
   getXyBuildings,
} from "../../../shared/logic/IntraTickCache";
import { getVotedBoostId } from "../../../shared/logic/PlayerTradeLogic";
import { getGreatPersonThisRunLevel } from "../../../shared/logic/RebornLogic";
import { getBuildingsThatProduce } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { MarketOptions, type IMarketBuildingData, type IPetraBuildingData } from "../../../shared/logic/Tile";
import { addMultiplier } from "../../../shared/logic/Update";
import { VotedBoostType, type IGetVotedBoostResponse } from "../../../shared/utilities/Database";
import {
   MINUTE,
   forEach,
   hasFlag,
   keysOf,
   mapSafeAdd,
   mapSafePush,
   pointToTile,
   safeAdd,
   setFlag,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { client } from "../rpc/RPCClient";
import { Singleton } from "../utilities/Singleton";

let votedBoost: IGetVotedBoostResponse | null = null;
const lastVotedBoostUpdatedAt = 0;

export function onProductionComplete({ xy, offline }: { xy: Tile; offline: boolean }): void {
   const gs = getGameState();
   const building = gs.tiles.get(xy)?.building;
   if (!building) {
      return;
   }
   const buildingsByType = getTypeBuildings(gs);
   const grid = getGrid(gs);
   const buildingName = Config.Building[building.type].name();

   switch (building.type) {
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
            const building = getCompletedBuilding(xy, gs);
            if (building?.type === "Caravansary") {
               mapSafePush(Tick.next.tileMultipliers, xy, {
                  output: 5,
                  storage: 5,
                  source: buildingName,
               });
            }
            if (building?.type === "Market") {
               const market = building as IMarketBuildingData;
               if (!hasFlag(market.marketOptions, MarketOptions.UniqueTrades)) {
                  market.marketOptions = setFlag(market.marketOptions, MarketOptions.UniqueTrades);
                  market.marketOptions = setFlag(market.marketOptions, MarketOptions.ForceUpdateOnce);
               }
            }
         }
         break;
      }
      case "ColossusOfRhodes": {
         let happiness = 0;
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const building = getCompletedBuilding(pointToTile(neighbor), gs);
            if (building && !Config.Building[building.type].output.Worker) {
               happiness++;
            }
         }
         Tick.next.globalMultipliers.happiness.push({ value: happiness, source: buildingName });
         break;
      }
      case "HagiaSophia": {
         if (!Tick.current.notProducingReasons.has(xy)) {
            Tick.next.globalMultipliers.happiness.push({
               value: Config.Building.HagiaSophia.input.Faith!,
               source: buildingName,
            });
         }
         break;
      }
      case "Colosseum": {
         if (!Tick.current.notProducingReasons.has(xy)) {
            Tick.next.globalMultipliers.happiness.push({
               value: Config.Building.Colosseum.input.Chariot!,
               source: buildingName,
            });
         }
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
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const building = gs.tiles.get(pointToTile(neighbor))?.building;
            if (building && building.type === "Aqueduct") {
               mapSafePush(Tick.next.tileMultipliers, pointToTile(neighbor), {
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
                  if (neighborTile?.building?.type === "IronMiningCamp" && neighborTile.deposit.Iron) {
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
      case "Petra": {
         if (offline) {
            break;
         }
         const petra = building as IPetraBuildingData;
         if (petra.speedUp > 1 && (petra.resources.Warp ?? 0) > 0) {
            --petra.resources.Warp!;
            Singleton().ticker.speedUp = petra.speedUp;
         } else {
            petra.speedUp = 1;
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
         const scienceProduced = upgrades * OXFORD_SCIENCE_PER_UPGRADE;
         safeAdd(getSpecialBuildings(gs).Headquarter.building.resources, "Science", scienceProduced);
         Tick.next.scienceProduced.set(xy, scienceProduced);
         break;
      }
      case "StPetersBasilica": {
         let totalFaith = 0;
         let totalLevel = 0;
         getBuildingsThatProduce("Faith").forEach((b) => {
            addMultiplier(b, { storage: 1 }, buildingName);
            getBuildingsByType(b, gs)?.forEach((tile, xy) => {
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
            Tick.next.notProducingReasons.set(xy, "StorageFull");
         } else if (toProduce > 0) {
            Tick.next.notProducingReasons.delete(xy);
         } else {
            Tick.next.notProducingReasons.set(xy, "NotEnoughResources");
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
            const building = getCompletedBuilding(neighborXy, gs);
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
                  worker: building.level - 20,
                  source: buildingName,
               });
            }
         });
         break;
      }
      case "Poseidon": {
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            const building = getCompletedBuilding(neighborXy, gs);
            if (building && !isSpecialBuilding(building.type) && building.level < 20) {
               building.level = 20;
            }
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
            if (getCompletedBuilding(neighborXy, gs)?.type === "SteelMill") {
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
            const b = getCompletedBuilding(neighborXy, gs);
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
            if (getCompletedBuilding(neighborXy, gs)?.type === "Shrine") {
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
            if (isWorldWonder(building.type) && building.status === "building") {
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
                  if (getCompletedBuilding(pointToTile(n), gs)?.type === type) {
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
            const building = getCompletedBuilding(neighborXy, gs);
            if (building?.type === "WheatFarm") {
               mapSafePush(Tick.next.tileMultipliers, neighborXy, {
                  storage: 5,
                  output: 5,
                  source: buildingName,
               });
            }
         }
         const total =
            getGreatPersonThisRunLevel(gs.greatPeople.Hatshepsut ?? 0) +
            (getGameOptions().greatPeople.Hatshepsut?.level ?? 0);
         if (total > 0) {
            tickGreatPersonBoost(Config.GreatPerson.Hatshepsut, total, buildingName);
         }
         break;
      }
      case "AbuSimbel": {
         let count = 0;
         for (const neighbor of grid.getNeighbors(tileToPoint(xy))) {
            const neighborXy = pointToTile(neighbor);
            if (isWorldWonder(getCompletedBuilding(neighborXy, gs)?.type)) {
               ++count;
            }
         }
         Tick.next.globalMultipliers.happiness.push({ value: count, source: buildingName });
         const total =
            getGreatPersonThisRunLevel(gs.greatPeople.RamessesII ?? 0) +
            (getGameOptions().greatPeople.RamessesII?.level ?? 0);
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
                  if (getCompletedBuilding(pointToTile(n), gs)?.type === type) {
                     ++count;
                  }
               }
               mapSafePush(Tick.next.tileMultipliers, tileXy, {
                  input: count,
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
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            Tick.next.powerGrid.add(pointToTile(point));
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
            const building = getCompletedBuilding(neighborXy, gs)?.type;
            if (!building) continue;
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
      case "UnitedNations": {
         forEach(Config.BuildingTier, (building, tier) => {
            if (tier >= 4 && tier <= 6) {
               addMultiplier(building, { output: 1, worker: 1, storage: 1 }, buildingName);
            }
         });

         if (Date.now() - lastVotedBoostUpdatedAt < MINUTE) {
            return;
         }
         if (votedBoost === null || getVotedBoostId() !== votedBoost.id) {
            client.getVotedBoosts().then((resp) => {
               votedBoost = resp;
            });
         }
         if (votedBoost) {
            const current = votedBoost.current.options[votedBoost.current.voted];
            switch (current.type) {
               case VotedBoostType.Multipliers: {
                  current.buildings.forEach((b) => {
                     addMultiplier(b, { output: 5, worker: 5, storage: 5 }, buildingName);
                  });
                  break;
               }
            }
         }
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
