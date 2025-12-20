import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { GreatPersonTickFlag, type GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import {
   IOFlags,
   addWorkers,
   saviorOnSpilledBloodProductionMultiplier as auroraBorealisProductionMultiplier,
   forEachMultiplier,
   generateScienceFromFaith,
   getAvailableWorkers,
   getBranCastleRequiredWorkers,
   getBuildingCost,
   getCathedralOfBrasiliaResources,
   getGreatWallRange,
   getMaxWarpStorage,
   getScienceFromWorkers,
   getWonderExtraLevel,
   getWorkingBuilding,
   getYellowCraneTowerRange,
   isBuildingWellStocked,
   isFestival,
   isSpecialBuilding,
   isWorldOrNaturalWonder,
   isWorldWonder,
   totalMultiplierFor,
   useWorkers,
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
   TRADE_TILE_ALLY_BONUS,
   TRADE_TILE_BONUS,
   TRADE_TILE_NEIGHBOR_BONUS,
} from "../../../shared/logic/Constants";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { GameStateFlags } from "../../../shared/logic/GameState";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import {
   getBuildingIO,
   getBuildingsByType,
   getGrid,
   getTransportStat,
   getTypeBuildings,
   getXyBuildings,
} from "../../../shared/logic/IntraTickCache";
import { LogicResult } from "../../../shared/logic/LogicResult";
import { getWeekId } from "../../../shared/logic/PlayerTradeLogic";
import {
   getGreatPeopleChoiceCount,
   getGreatPeopleForWisdom,
   getGreatPersonTotalLevel,
   getPermanentGreatPeopleLevel,
   getRebirthGreatPeopleCount,
   rollGreatPeopleThisRun,
} from "../../../shared/logic/RebirthLogic";
import { deductResourceFrom } from "../../../shared/logic/ResourceLogic";
import {
   getBuildingUnlockAge,
   getBuildingsUnlockedBefore,
   getCurrentAge,
   getUnlockedTechAges,
} from "../../../shared/logic/TechLogic";
import { NotProducingReason, Tick } from "../../../shared/logic/TickLogic";
import type {
   IAuroraBorealisBuildingData,
   ICentrePompidouBuildingData,
   IChateauFrontenacBuildingData,
   IGreatPeopleBuildingData,
   IIdeologyBuildingData,
   IItaipuDamBuildingData,
   ILouvreBuildingData,
   IReligionBuildingData,
   ISwissBankBuildingData,
   ITileData,
   ITraditionBuildingData,
   IZugspitzeBuildingData,
} from "../../../shared/logic/Tile";
import { addLevelBoost, addMultiplier, tickUnlockable } from "../../../shared/logic/Update";
import { VotedBoostType, type IGetVotedBoostResponse } from "../../../shared/utilities/Database";
import {
   MINUTE,
   clamp,
   clearFlag,
   filterOf,
   firstKeyOf,
   forEach,
   keysOf,
   mapSafeAdd,
   mapSafePush,
   pointToTile,
   round,
   safeAdd,
   setFlag,
   sizeOf,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { srand } from "../../../shared/utilities/Random";
import { L, t } from "../../../shared/utilities/i18n";
import { TileBuildings, client, isAllyWith, populateTileBuildings } from "../rpc/RPCClient";
import { SteamClient, isSteam } from "../rpc/SteamClient";
import { getNeighboringPlayers, getOwnedOrOccupiedTiles } from "../scenes/PathFinder";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { hasOpenModal, showModal } from "../ui/GlobalModal";
import { Singleton } from "../utilities/Singleton";
import { playAgeUp } from "../visuals/Sound";

let votedBoost: IGetVotedBoostResponse | null = null;
let lastVotedBoostUpdatedAt = 0;
let lastFujiGeneratedAt = Date.now();
let fujiTick = 0;
let declareFriendshipAchievementUnlocked = false;

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
         if (gs.unlockedUpgrades.SpaceshipIdle) {
            tickUnlockable(Config.Upgrade.SpaceshipIdle, t(L.WishlistSpaceshipIdle), gs);
         }
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

         populateTileBuildings();

         const wtoLevel = Tick.current.specialBuildings.get("WorldTradeOrganization")?.building.level ?? 0;

         getOwnedOrOccupiedTiles().forEach((xy, i) => {
            const building = TileBuildings.get(xy);
            if (building) {
               addMultiplier(
                  building,
                  { output: TRADE_TILE_BONUS, unstable: true },
                  `${t(L.PlayerMapMapTileBonus)} (${i + 1})`,
               );
               if (wtoLevel > 0) {
                  addMultiplier(
                     building,
                     { output: wtoLevel, unstable: true },
                     `${t(L.WorldTradeOrganization)} (${i + 1})`,
                  );
               }
            }
         });

         let allyCount = 0;
         const hasLakeLouise = Tick.current.specialBuildings.has("LakeLouise");
         const lakeLouiseLevelBoosts = new Map<Building, number>();
         getNeighboringPlayers().forEach((player) => {
            let isAlly = false;
            player.forEach(([xy, tile]) => {
               const building = TileBuildings.get(xy);
               if (building) {
                  if (isAllyWith(tile)) {
                     isAlly = true;
                     addMultiplier(
                        building,
                        { output: TRADE_TILE_ALLY_BONUS, unstable: true },
                        `${t(L.PlayerMapMapAllyTileBonus)} (${tile.handle})`,
                     );
                     if (hasLakeLouise) {
                        mapSafeAdd(lakeLouiseLevelBoosts, building, TRADE_TILE_ALLY_BONUS);
                     }
                  } else {
                     addMultiplier(
                        building,
                        { output: TRADE_TILE_NEIGHBOR_BONUS, unstable: true },
                        `${t(L.PlayerMapMapNeighborTileBonus)} (${tile.handle})`,
                     );
                  }
               }
            });
            if (isAlly) {
               ++allyCount;
            }
         });

         for (const [building, level] of lakeLouiseLevelBoosts) {
            addLevelBoost(building, level, t(L.LakeLouise), gs);
         }

         if (isSteam() && allyCount > 0 && !declareFriendshipAchievementUnlocked) {
            SteamClient.unlockAchievement("DeclareFriendship");
            declareFriendshipAchievementUnlocked = true;
         }

         if (allyCount >= 3) {
            gs.flags = setFlag(gs.flags, GameStateFlags.HasThreeAllies);
         } else {
            gs.flags = clearFlag(gs.flags, GameStateFlags.HasThreeAllies);
         }

         if (!offline) {
            gs.speedUp = clamp(gs.speedUp, 1, getMaxWarpStorage(gs));
            const cost = (gs.speedUp - 1) / gs.speedUp;
            if (gs.speedUp > 1 && building.resources.Warp && building.resources.Warp >= cost) {
               building.resources.Warp -= cost;
               gs.flags = setFlag(gs.flags, GameStateFlags.HasUsedTimeWarp);
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
                  output: mul,
                  source: t(L.NaturalWonderName, { name: buildingName }),
               });
               if (isFestival("Alps", gs)) {
                  mapSafePush(Tick.next.levelBoost, xy, {
                     value: mul,
                     source: t(L.NaturalWonderName, { name: buildingName }),
                  });
               }
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
            Tick.next.additionalProductions.push({ xy, res: "Science", amount: science });
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
                  def.tick(gp, 1, `${buildingName}: ${def.name()}`, GreatPersonTickFlag.Unstable);
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
                     worker: tier,
                     storage: tier,
                     source: buildingName,
                  });
               }
            }
         }
         if (isFestival("Poseidon", gs)) {
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
         const total = getGreatPersonTotalLevel("Hatshepsut", gs);
         if (total > 0) {
            Config.GreatPerson.Hatshepsut.tick(
               "Hatshepsut",
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
         const total = getGreatPersonTotalLevel("RamessesII", gs);
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
                  output: count,
                  source: buildingName,
               });
               if (isFestival("GreatSphinx", gs)) {
                  mapSafePush(Tick.next.levelBoost, tileXy, {
                     value: count,
                     source: t(L.NaturalWonderName, { name: buildingName }),
                  });
               }
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
         for (const point of grid.getRange(tileToPoint(xy), 1)) {
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
            if (votedBoost === null || getWeekId() !== votedBoost.id) {
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
                     addMultiplier(b, { output: 5 + (building.level - 1), unstable: true }, buildingName);
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
         const total = getGreatPersonTotalLevel("Confucius", gs);
         if (total > 0) {
            Config.GreatPerson.Confucius.tick(
               "Confucius",
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
            if (isFestival("GreatWall", gs)) {
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
         const total = getGreatPersonTotalLevel("ZhengHe", gs);
         if (total > 0) {
            Config.GreatPerson.ZhengHe.tick(
               "ZhengHe",
               total,
               `${buildingName}: ${Config.GreatPerson.ZhengHe.name()}`,
               GreatPersonTickFlag.None,
            );
         }
         break;
      }
      case "PorcelainTower": {
         Tick.next.globalMultipliers.happiness.push({ value: 5, source: buildingName });
         if (isFestival("PorcelainTower", gs)) {
            forEach(gs.greatPeople, (gp, level) => {
               if (level > 0) {
                  const def = Config.GreatPerson[gp];
                  def.tick(gp, 1, `${t(L.Festival)}: ${def.name()}`, GreatPersonTickFlag.Unstable);
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
            Tick.next.additionalProductions.push({ xy, res: "Science", amount: science });
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
            const tier = Config.BuildingTier[b] ?? 0;
            if ((age === "WorldWarAge" || age === "ColdWarAge") && tier > 0) {
               const m = Math.abs(Config.TechAge[age].idx + 1 - tier);
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
            const total = getGreatPersonTotalLevel(gp, gs, options);
            if (total > 0) {
               def.tick(gp, total, `${buildingName}: ${def.name()}`, GreatPersonTickFlag.Unstable);
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
                  isFestival("WallStreet", gs) &&
                  (Config.Building[b.type].output.MutualFund ||
                     Config.Building[b.type].output.HedgeFund ||
                     Config.Building[b.type].output.Bitcoin)
               ) {
                  isValid = true;
               }

               if (isValid) {
                  let multiplier = Math.round(srand(`wallstreet:${gs.lastPriceUpdated}:${t}`)() * 4 + 1);
                  if (isFestival("WallStreet", gs)) {
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

         if (isFestival("WallStreet", gs)) {
            addMultiplier("ResearchFund", { output: 5 }, buildingName);
         }

         const total = getGreatPersonTotalLevel("JohnDRockefeller", gs, options);
         if (total > 0) {
            Config.GreatPerson.JohnDRockefeller.tick(
               "JohnDRockefeller",
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
         const total = getGreatPersonTotalLevel("JPMorgan", gs, options);
         if (total > 0) {
            Config.GreatPerson.JPMorgan.tick(
               "JPMorgan",
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
            getGreatPersonTotalLevel("AlbertEinstein", gs, options) +
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
            "HarunAlRashid",
            getGreatPersonTotalLevel("HarunAlRashid", gs, options),
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
            const candidates = isFestival("ZigguratOfUr", gs)
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
         const total = getGreatPersonTotalLevel("NebuchadnezzarII", gs, options);
         if (total > 0) {
            Config.GreatPerson.NebuchadnezzarII.tick(
               "NebuchadnezzarII",
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
            const candidates = isFestival("EuphratesRiver", gs)
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
         const extraLevel = getWonderExtraLevel(building.type);
         Tick.next.globalMultipliers.storage.push({
            value: 5 + (building.level - 1 + extraLevel),
            source: buildingName,
         });
         break;
      }
      case "MarinaBaySands": {
         const extraLevel = getWonderExtraLevel(building.type);
         Tick.next.globalMultipliers.worker.push({
            value: 5 + 1 * (building.level - 1 + extraLevel),
            source: buildingName,
         });
         break;
      }
      case "PalmJumeirah": {
         const extraLevel = getWonderExtraLevel(building.type);
         Tick.next.globalMultipliers.builderCapacity.push({
            value: 10 + 2 * (building.level - 1 + extraLevel),
            source: buildingName,
         });
         break;
      }
      case "AldersonDisk": {
         const extraLevel = getWonderExtraLevel(building.type);
         Tick.next.globalMultipliers.happiness.push({
            value: 25 + 5 * (building.level - 1 + extraLevel),
            source: buildingName,
         });
         break;
      }
      case "DysonSphere": {
         const extraLevel = getWonderExtraLevel(building.type);
         Tick.next.globalMultipliers.output.push({
            value: 5 + 1 * (building.level - 1 + extraLevel),
            source: buildingName,
         });
         break;
      }
      case "MatrioshkaBrain": {
         const extraLevel = getWonderExtraLevel(building.type);
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: 5 + (building.level - 1 + extraLevel),
            source: buildingName,
         });
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: 5 + (building.level - 1 + extraLevel),
            source: buildingName,
         });
         const hq = Tick.current.specialBuildings.get("Headquarter");
         if (hq) {
            const scienceValue = (hq.building.resources?.Science ?? 0) * SCIENCE_VALUE;
            Tick.next.totalValue += scienceValue;
            mapSafeAdd(Tick.next.resourceValueByTile, xy, scienceValue);
            mapSafeAdd(Tick.next.resourceValues, "Science", scienceValue);
         }
         const multiplier = building.level - 1 + extraLevel;
         if (multiplier > 0) {
            forEach(Config.Building, (b, def) => {
               if (def.output.Science) {
                  addMultiplier(b, { output: multiplier }, buildingName);
               }
            });
            addMultiplier("CloneLab", { output: multiplier }, buildingName);
         }
         break;
      }
      case "LargeHadronCollider": {
         const level = 2 + building.level - 1;
         forEach(Config.GreatPerson, (p, def) => {
            if (def.age === "InformationAge") {
               def.tick(p, level, `${buildingName}: ${def.name()}`, GreatPersonTickFlag.None);
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
               def.tick(p, 1, `${buildingName}: ${def.name()}`, GreatPersonTickFlag.Unstable);
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
               const amount = isFestival("MountFuji", gs) ? 40 : 20;
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
               addMultiplier(
                  b,
                  { output: building.level + getWonderExtraLevel(building.type) },
                  buildingName,
               );
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
               gp,
               isFestival("Zugspitze", gs) ? level * 2 : level,
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
                  gp,
                  1,
                  t(L.CambridgeUniversitySource, { age: Config.TechAge[age].name() }),
                  GreatPersonTickFlag.None,
               );
            });
         });
         break;
      }
      case "TowerBridge": {
         safeAdd(building.resources, "Cycle", isFestival("TowerBridge", gs) ? 1.2 : 1);
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
               if (!getWorkingBuilding(xy, gs)) {
                  return;
               }
               grid.getNeighbors(tileToPoint(xy)).forEach((p) => {
                  mapSafePush(Tick.next.tileMultipliers, pointToTile(p), {
                     output: isFestival("EastIndiaCompany", gs) ? building.level : 0.5 * building.level,
                     source: buildingName,
                     unstable: true,
                  });
               });
            });
         }
         break;
      }
      case "DuneOfPilat": {
         const age = getCurrentAge(gs);
         const previousAge = firstKeyOf(
            filterOf(Config.TechAge, (k, v) => v.idx === Config.TechAge[age].idx - 1),
         );
         if (previousAge) {
            const ageWisdomLevel = options.ageWisdom[previousAge] ?? 0;
            getGreatPeopleForWisdom(previousAge).forEach((gp) => {
               const greatPerson = Config.GreatPerson[gp];
               greatPerson.tick(gp, ageWisdomLevel, t(L.DuneOfPilat), GreatPersonTickFlag.Unstable);
            });
         }
         break;
      }
      case "ArcDeTriomphe": {
         const happiness = Tick.current.happiness?.value ?? 0;
         if (happiness > 0) {
            Tick.next.globalMultipliers.builderCapacity.push({
               value: Math.floor(happiness) * (isFestival("ArcDeTriomphe", gs) ? 2 : 1),
               source: buildingName,
            });
         }
         break;
      }
      case "MontSaintMichel": {
         const { workersBusy, workersAfterHappiness } = getScienceFromWorkers(gs);
         const idleWorkers = workersAfterHappiness - workersBusy;
         const culture = idleWorkers / (Config.MaterialPrice.Culture ?? 1);
         const value = getBuildingCost(building);
         if ((building.resources.Culture ?? 0) < (value.Culture ?? 0)) {
            safeAdd(building.resources, "Culture", culture * (isFestival("MontSaintMichel", gs) ? 2 : 1));
         }
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            mapSafePush(Tick.next.tileMultipliers, pointToTile(point), {
               storage: building.level,
               source: buildingName,
            });
         }
         break;
      }
      case "Louvre": {
         const louvre = building as ILouvreBuildingData;
         const greatPeopleAtRebirth = getRebirthGreatPeopleCount();
         while (louvre.greatPeopleCount < Math.floor(greatPeopleAtRebirth / 10)) {
            ++louvre.greatPeopleCount;
            const candidates = rollGreatPeopleThisRun(
               getUnlockedTechAges(gs),
               gs.city,
               getGreatPeopleChoiceCount(gs),
            );
            if (candidates) {
               gs.greatPeopleChoicesV2.push(candidates);
            }
            if (!hasOpenModal() && gs.greatPeopleChoicesV2.length > 0) {
               playAgeUp();
               showModal(<ChooseGreatPersonModal permanent={false} />);
            }
         }
         break;
      }
      case "CentrePompidou": {
         const pompidou = building as ICentrePompidouBuildingData;
         const multiplier = isFestival("CentrePompidou", gs) ? 2 : 1;
         const cities = pompidou.cities.size + 1;
         Tick.next.globalMultipliers.output.push({
            value: multiplier * cities,
            source: buildingName,
         });
         Tick.next.globalMultipliers.storage.push({
            value: 2 * multiplier * cities,
            source: buildingName,
         });
         building.resources = {};
         break;
      }
      case "BlueMosque": {
         const hagiaSophia = Tick.current.specialBuildings.get("HagiaSophia");
         let multiplier = 1;
         if (hagiaSophia && grid.distanceTile(hagiaSophia.tile, xy) <= 1) {
            multiplier += 1;
         }
         Tick.current.specialBuildings.forEach((data, building) => {
            if (isWorldWonder(building)) {
               grid.getNeighbors(tileToPoint(data.tile)).forEach((p) => {
                  mapSafePush(Tick.next.tileMultipliers, pointToTile(p), {
                     output: multiplier,
                     worker: multiplier,
                     storage: multiplier,
                     source: `${Config.Building[building].name()} (${buildingName})`,
                  });
               });
            }
         });
         break;
      }
      case "MountArarat": {
         const level = isFestival("MountArarat", gs)
            ? Math.floor(Math.sqrt(getPermanentGreatPeopleLevel(options)))
            : Math.floor(Math.cbrt(getPermanentGreatPeopleLevel(options)));
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            mapSafePush(Tick.next.tileMultipliers, pointToTile(point), {
               output: level,
               worker: level,
               storage: level,
               source: buildingName,
            });
         }
         break;
      }
      case "Cappadocia": {
         for (const point of grid.getRange(tileToPoint(xy), 3)) {
            const building = gs.tiles.get(pointToTile(point))?.building;
            const factor = isFestival("Cappadocia", gs) ? 2 : 1;
            if (building && !isWorldOrNaturalWonder(building.type) && building.level > 30) {
               mapSafePush(Tick.next.tileMultipliers, pointToTile(point), {
                  output: factor * (building.level - 30),
                  worker: factor * (building.level - 30),
                  storage: factor * (building.level - 30),
                  source: buildingName,
               });
            }
         }
         break;
      }
      case "TopkapiPalace": {
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            const tile = pointToTile(point);
            const pm = totalMultiplierFor(tile, "output", 1, true, gs);
            mapSafePush(Tick.next.tileMultipliers, pointToTile(point), {
               storage: pm / 2,
               source: buildingName,
            });
         }
         break;
      }
      case "SwissBank": {
         const swissBank = building as ISwissBankBuildingData;
         const resource = swissBank.resource;
         const price = resource ? Config.MaterialPrice[resource] : undefined;
         if (resource && price) {
            const multiplier = totalMultiplierFor(xy, "output", 1, false, gs);
            const levelBoost = Tick.current.levelBoost.get(xy)?.reduce((acc, lb) => acc + lb.value, 0) ?? 0;
            const { amount } = deductResourceFrom(
               resource,
               (10_000_000 *
                  multiplier *
                  (building.level + (Tick.current.electrified.get(xy) ?? 0) + levelBoost)) /
                  price,
               Array.from(Tick.current.playerTradeBuildings.keys()),
               gs,
            );
            if (amount > 0) {
               const kotiAmount = (amount * price) / 10_000_000;
               safeAdd(building.resources, "Koti", kotiAmount);
               Tick.next.additionalConsumptions.push({ xy, res: resource, amount });
               Tick.next.additionalProductions.push({ xy, res: "Koti", amount: kotiAmount });
            } else {
               Tick.next.notProducingReasons.set(xy, NotProducingReason.NotEnoughResources);
            }
         } else {
            Tick.next.notProducingReasons.set(xy, NotProducingReason.TurnedOff);
         }
         break;
      }
      case "ItaipuDam": {
         const itaipuDam = building as IItaipuDamBuildingData;
         const multiplier = itaipuDam.productionMultiplier;
         const levelBoost = building.level + getWonderExtraLevel(building.type) - multiplier;

         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            const t = pointToTile(point);
            if (multiplier > 0) {
               mapSafePush(Tick.next.tileMultipliers, t, {
                  output: multiplier,
                  source: buildingName,
               });
            }
            if (levelBoost > 0) {
               mapSafePush(Tick.next.levelBoost, t, {
                  value: levelBoost,
                  source: buildingName,
               });
            }
            Tick.next.powerGrid.add(t);
         }
         break;
      }
      case "Capybara":
      case "GiantOtter": {
         let emptyTiles = 0;
         const range = isFestival(building.type, gs) ? 3 : 2;
         for (const point of grid.getRange(tileToPoint(xy), range)) {
            const t = pointToTile(point);
            const building = gs.tiles.get(t)?.building;
            if (!building) {
               emptyTiles++;
            }
         }
         for (const point of grid.getRange(tileToPoint(xy), range)) {
            const t = pointToTile(point);
            mapSafePush(Tick.next.tileMultipliers, t, {
               output: emptyTiles,
               source: buildingName,
            });
         }
         break;
      }
      case "Hoatzin":
      case "RoyalFlycatcher": {
         let emptyTiles = 0;
         const range = isFestival(building.type, gs) ? 3 : 2;
         for (const point of grid.getRange(tileToPoint(xy), range)) {
            const t = pointToTile(point);
            const building = gs.tiles.get(t)?.building;
            if (!building) {
               emptyTiles++;
            }
         }
         for (const point of grid.getRange(tileToPoint(xy), range)) {
            const t = pointToTile(point);
            mapSafePush(Tick.next.levelBoost, t, {
               value: emptyTiles,
               source: buildingName,
            });
         }
         break;
      }
      case "GlassFrog":
      case "PygmyMarmoset": {
         let emptyTiles = 0;
         for (const point of grid.getRange(tileToPoint(xy), 3)) {
            const t = pointToTile(point);
            const building = gs.tiles.get(t)?.building;
            if (!building) {
               emptyTiles++;
            }
         }
         for (const point of grid.getRange(tileToPoint(xy), 3)) {
            const t = pointToTile(point);
            mapSafePush(Tick.next.tileMultipliers, t, {
               storage: emptyTiles,
               source: buildingName,
            });
         }
         break;
      }
      case "CathedralOfBrasilia": {
         const multiplier = isFestival("CathedralOfBrasilia", gs) ? 2 : 1;

         const { buildings, unused } = getCathedralOfBrasiliaResources(xy, gs);

         if (buildings.size > 1 && unused <= 1) {
            buildings.forEach((building) => {
               addMultiplier(
                  building,
                  {
                     output: multiplier * buildings.size,
                     unstable: true,
                  },
                  buildingName,
               );
            });
         }

         break;
      }
      case "RedFort": {
         const levelBoost = building.level + getWonderExtraLevel(building.type);
         for (const point of grid.getRange(tileToPoint(xy), isFestival("RedFort", gs) ? 5 : 3)) {
            mapSafePush(Tick.next.levelBoost, pointToTile(point), {
               value: levelBoost,
               source: buildingName,
            });
         }
         break;
      }
      case "GangesRiver": {
         const buildings = new Set<Building>();
         for (const point of grid.getRange(tileToPoint(xy), isFestival("GangesRiver", gs) ? 2 : 1)) {
            const tile = pointToTile(point);
            const targetBuilding = gs.tiles.get(tile)?.building;
            if (targetBuilding) {
               buildings.add(targetBuilding.type);
            }
         }
         buildings.forEach((building) => {
            const age = Config.BuildingTechAge[building];
            if (!age) {
               return;
            }
            if (isWorldOrNaturalWonder(building)) {
               return;
            }
            if (Config.Building[building].output.Worker) {
               return;
            }
            const wisdom = options.ageWisdom[age] ?? 0;
            if (wisdom > 0) {
               addMultiplier(building, { output: wisdom }, buildingName);
            }
         });
         break;
      }
      case "Sundarbans": {
         forEach(options.ageWisdom, (age, level) => {
            getGreatPeopleForWisdom(age).forEach((gp) => {
               const greatPerson = Config.GreatPerson[gp];
               greatPerson.tick(
                  gp,
                  level * 0.5,
                  `${buildingName} (${t(L.AgeWisdomSource, { age: Config.TechAge[age].name(), person: greatPerson.name() })})`,
                  GreatPersonTickFlag.None,
               );
            });
         });
         break;
      }
      case "BranCastle": {
         let workers = 0;
         for (const point of grid.getRange(tileToPoint(xy), 3)) {
            const targetXy = pointToTile(point);
            if (
               gs.tiles.get(targetXy)?.building?.status === "completed" &&
               !Tick.current.notProducingReasons.has(targetXy)
            ) {
               const output = getBuildingIO(targetXy, "output", IOFlags.Multiplier | IOFlags.Capacity, gs);
               if (output.Worker) {
                  workers += output.Worker;
               }
            }
         }
         LogicResult.branCastleGeneratedWorkers = workers;
         addWorkers("Worker", workers);
         if (getAvailableWorkers("Worker") >= workers) {
            useWorkers("Worker", workers, xy);
            LogicResult.branCastleEmployedWorkers = workers;
         }
         const { workersAfterHappiness } = getScienceFromWorkers(gs);
         let level = 0;
         while (getBranCastleRequiredWorkers(level) < workersAfterHappiness) {
            level++;
         }
         level = clamp(level - 1, 0, Number.POSITIVE_INFINITY);
         LogicResult.branCastleLevel = level;
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: level,
            source: buildingName,
         });
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: 2 * level,
            source: buildingName,
         });
         break;
      }
      case "PortOfSingapore": {
         addMultiplier("Warehouse", { output: building.level, storage: building.level }, buildingName);
         addMultiplier("Caravansary", { output: building.level, storage: building.level }, buildingName);
         addMultiplier("Market", { output: building.level, storage: building.level }, buildingName);
         break;
      }
      case "SydneyHarbourBridge": {
         const extraLevel = getWonderExtraLevel(building.type);
         forEach(Config.Building, (b, def) => {
            if (def.output.Power) {
               addMultiplier(b, { output: building.level + extraLevel }, buildingName);
            }
         });
         break;
      }
      case "GreatOceanRoad": {
         const buildings = new Set<Building>();
         getOwnedOrOccupiedTiles().forEach((xy, i) => {
            const building = TileBuildings.get(xy);
            if (building) {
               buildings.add(building);
            }
         });

         buildings.forEach((b) => {
            addLevelBoost(b, building.level, buildingName, gs);
         });

         if (isFestival(building.type, gs)) {
            buildings.forEach((b) => {
               addMultiplier(b, { output: building.level, unstable: true }, buildingName);
            });
         }
         break;
      }
      case "GreatBarrierReef": {
         const currentHappiness = clamp(Tick.current.happiness?.value ?? 0, 0, Number.POSITIVE_INFINITY);
         const age = Config.TechAge[getCurrentAge(gs)].idx + 1;
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: 0.2 * age * currentHappiness,
            source: buildingName,
         });
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: 0.1 * age * currentHappiness,
            source: buildingName,
         });
         break;
      }
      case "Uluru": {
         const range = isFestival(building.type, gs) ? 3 : 2;
         const greatPeople = sizeOf(gs.greatPeople);
         for (const point of grid.getRange(tileToPoint(xy), range)) {
            const t = pointToTile(point);
            const building = gs.tiles.get(t)?.building;
            if (building && !Config.Building[building.type].output.Worker) {
               mapSafePush(Tick.next.tileMultipliers, t, {
                  output: 0.5 * greatPeople,
                  source: buildingName,
               });
            }
         }
         break;
      }
      case "KizhiPogost": {
         const range = isFestival(building.type, gs) ? 4 : 2;
         const multiplier = totalMultiplierFor(xy, "output", 0, false, gs);
         for (const point of grid.getRange(tileToPoint(xy), range)) {
            const targetXy = pointToTile(point);
            if (targetXy === xy) {
               continue;
            }
            mapSafePush(Tick.next.tileMultipliers, targetXy, {
               output: multiplier,
               source: buildingName,
            });
         }
         break;
      }
      case "LakeBaikal": {
         const range = isFestival(building.type, gs) ? 4 : 2;
         let level = 0;
         for (const point of grid.getRange(tileToPoint(xy), range)) {
            const targetXy = pointToTile(point);
            if (targetXy === xy) {
               continue;
            }
            const building = gs.tiles.get(targetXy)?.building;
            if (building && building.status !== "building" && isWorldWonder(building.type)) {
               level += building.level;
            }
         }
         Tick.next.globalMultipliers.builderCapacity.push({
            value: level,
            source: buildingName,
         });
         break;
      }
      case "Hermitage": {
         const buildings = new Set<Building>();
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            const tile = pointToTile(point);
            const targetBuilding = gs.tiles.get(tile)?.building;
            if (targetBuilding) {
               buildings.add(targetBuilding.type);
            }
         }
         const level = building.level + getWonderExtraLevel(building.type);
         buildings.forEach((b) => {
            addMultiplier(b, { storage: level }, buildingName);
         });
         break;
      }
      case "Sputnik1": {
         forEach(Config.GreatPerson, (p, def) => {
            if (def.age === "ColdWarAge") {
               def.tick(p, building.level, `${buildingName}: ${def.name()}`, GreatPersonTickFlag.None);
            }
         });
         break;
      }
      case "AkademikLomonosov": {
         for (const point of grid.getRange(tileToPoint(xy), 2)) {
            Tick.next.powerGrid.add(pointToTile(point));
         }
         const multiplier = isFestival(building.type, gs) ? 2 : 1;
         mapSafeAdd(Tick.next.workersAvailable, "Power", 100_000 * building.level * multiplier);
         const ageWisdomLevel = options.ageWisdom.ColdWarAge ?? 0;
         if (ageWisdomLevel > 0) {
            addMultiplier(
               "Cosmodrome",
               { output: ageWisdomLevel * multiplier, storage: ageWisdomLevel * multiplier },
               buildingName,
            );
         }
         break;
      }
      case "AuroraBorealis": {
         const auroraBorealis = building as IAuroraBorealisBuildingData;
         const hours = Math.floor((gs.tick - auroraBorealis.startTick) / 3600);
         const range = isFestival(building.type, gs) ? 4 : 2;
         const multiplier = auroraBorealisProductionMultiplier(hours);
         for (const point of grid.getRange(tileToPoint(xy), range)) {
            const targetXy = pointToTile(point);
            if (targetXy === xy) {
               continue;
            }
            const building = gs.tiles.get(targetXy)?.building;
            if (building && !Config.Building[building.type].output.Worker) {
               mapSafePush(Tick.next.tileMultipliers, targetXy, {
                  output: multiplier,
                  source: buildingName,
                  unstable: true,
               });
            }
         }
         break;
      }
      case "ChateauFrontenac": {
         const chateauFrontenac = building as IChateauFrontenacBuildingData;
         const result = new Map<Building, number>();
         forEach(chateauFrontenac.buildings, (_, data) => {
            if (data.selected) {
               mapSafeAdd(result, data.selected, 1);
            }
         });
         const multiplier = isFestival(building.type, gs) ? 2 : 1;
         result.forEach((level, building) => {
            addLevelBoost(building, level * multiplier, buildingName, gs);
         });
         break;
      }
      case "Habitat67": {
         addMultiplier(
            "AILab",
            {
               output: building.level + getWonderExtraLevel(building.type),
               worker: building.level,
               storage: building.level,
            },
            buildingName,
         );
         const happiness = Tick.current.happiness?.value ?? 0;
         const multiplier = isFestival(building.type, gs) ? 2 : 1;
         const levelBoost = Math.round(happiness / 5) * multiplier;
         if (levelBoost > 0) {
            addLevelBoost("AILab", levelBoost, buildingName, gs);
         }
         break;
      }
   }
}
