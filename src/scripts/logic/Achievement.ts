import type { TechAge } from "../../../shared/definitions/TechDefinitions";
import {
   findSpecialBuilding,
   getScienceFromWorkers,
   isNaturalWonder,
   isWorldWonder,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { GameStateFlags, type GameState } from "../../../shared/logic/GameState";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import { getPermanentGreatPeopleLevel, getRebirthGreatPeopleCount } from "../../../shared/logic/RebirthLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import type { ICentrePompidouBuildingData } from "../../../shared/logic/Tile";
import { OnTechUnlocked } from "../../../shared/logic/Update";
import { HOUR, SECOND, forEach, hasFlag, sizeOf } from "../../../shared/utilities/Helper";
import { SteamClient, isSteam } from "../rpc/SteamClient";

OnTechUnlocked.on((tech) => {
   if (!isSteam()) return;
   switch (tech) {
      case "Future": {
         const gs = getGameState();
         SteamClient.unlockAchievement("Future");
         if (gs.seconds * SECOND <= 24 * HOUR) {
            SteamClient.unlockAchievement("OneMoreTurn");
         }
         if (!hasFlag(gs.flags, GameStateFlags.HasUsedTimeWarp)) {
            SteamClient.unlockAchievement("GrandfatherParadox");
         }
         if (!hasFlag(gs.flags, GameStateFlags.HasDemolishedBuilding)) {
            SteamClient.unlockAchievement("Preservationist");
         }
         if ((Tick.current.workersAvailable.get("Power") ?? 0) >= 1_000_000) {
            SteamClient.unlockAchievement("PowerfulEmpire");
         }
         if (getRebirthGreatPeopleCount() <= 200) {
            SteamClient.unlockAchievement("RushToFuture");
         }
         break;
      }
   }
});

export function checkAgeAchievements(currentAge: TechAge): void {
   if (!isSteam()) return;
   switch (currentAge) {
      case "BronzeAge": {
         SteamClient.unlockAchievement("Bronze");
         break;
      }
      case "IronAge": {
         SteamClient.unlockAchievement("Iron");
         break;
      }
      case "ClassicalAge": {
         SteamClient.unlockAchievement("Classical");
         if (getGameState().tradeValue > 0) {
            SteamClient.unlockAchievement("YourTradeIsMostWelcome");
         }
         break;
      }
      case "MiddleAge": {
         SteamClient.unlockAchievement("Medieval");
         break;
      }
      case "RenaissanceAge": {
         SteamClient.unlockAchievement("Renaissance");
         let discoveredNaturalWonders = 0;
         let builtWonders = 0;
         getGameState().tiles.forEach((data, tile) => {
            if (data.building && isNaturalWonder(data.building.type) && data.explored) {
               ++discoveredNaturalWonders;
            }
            if (
               data.building &&
               isWorldWonder(data.building.type) &&
               data.building.type !== "CentrePompidou"
            ) {
               ++builtWonders;
            }
         });
         if (discoveredNaturalWonders === 0) {
            SteamClient.unlockAchievement("AgeOfNoDiscovery");
         }
         if (builtWonders === 0) {
            SteamClient.unlockAchievement("WonderlessEmpire");
         }
         break;
      }
      case "IndustrialAge": {
         SteamClient.unlockAchievement("Industrial");
         if (getGameState().tradeValue <= 0) {
            SteamClient.unlockAchievement("WeAreNotInterestedInThisTrade");
         }
         break;
      }
      case "WorldWarAge": {
         SteamClient.unlockAchievement("WorldWars");
         break;
      }
      case "ColdWarAge": {
         SteamClient.unlockAchievement("ColdWar");
         break;
      }
      case "InformationAge": {
         SteamClient.unlockAchievement("Information");
         break;
      }
   }
}

export function checkRebirthAchievements(extraGP: number, gs: GameState): void {
   if (!isSteam()) return;
   if (extraGP >= 1) {
      switch (gs.city) {
         case "Rome": {
            SteamClient.unlockAchievement("PaxRomana");
            break;
         }
         case "Athens": {
            SteamClient.unlockAchievement("Olympian");
            break;
         }
         case "Memphis": {
            SteamClient.unlockAchievement("EyeOfHorus");
            break;
         }
         case "Beijing": {
            SteamClient.unlockAchievement("MandateOfHeaven");
            break;
         }
         case "NewYork": {
            SteamClient.unlockAchievement("TheBigApple");
            break;
         }
         case "Babylon": {
            SteamClient.unlockAchievement("LionOfBabylon");
            break;
         }
         case "Kyoto": {
            SteamClient.unlockAchievement("Heian-kyo");
            break;
         }
         case "German": {
            SteamClient.unlockAchievement("EisernerKanzler");
            break;
         }
         case "English": {
            SteamClient.unlockAchievement("ThreeLions");
            break;
         }
         case "French": {
            SteamClient.unlockAchievement("ViveLaFrance");
            break;
         }
         case "Ottoman": {
            SteamClient.unlockAchievement("SultanOfSultans");
            break;
         }
         case "Brazilian": {
            SteamClient.unlockAchievement("SambaKing");
            break;
         }
         case "Indian": {
            SteamClient.unlockAchievement("KeeperOfDharma");
            break;
         }
         case "Australian": {
            SteamClient.unlockAchievement("WaltzingMatilda");
            break;
         }
      }
   }

   SteamClient.unlockAchievement("AreWeThereYet");

   let wonders = 0;
   let maxLevel = 0;
   let emptyTiles = 0;
   let unexploredTiles = 0;
   let wonderLevels = 0;

   const workerStat = getScienceFromWorkers(gs);

   if (workerStat.workersAfterHappiness >= 8_000_000_000) {
      SteamClient.unlockAchievement("TheWorldIsNotEnough");
   }

   if (workerStat.workersAfterHappiness - workerStat.workersBusy >= 10_000_000) {
      SteamClient.unlockAchievement("TheGreatDepression");
   }

   let minAgeWisdomLevel = Number.POSITIVE_INFINITY;

   const options = getGameOptions();
   forEach(Config.TechAge, (age) => {
      if (age === "StoneAge") {
         return;
      }
      const level = options.ageWisdom[age] ?? 0;
      if (level < minAgeWisdomLevel) {
         minAgeWisdomLevel = level;
      }
   });

   if (minAgeWisdomLevel >= 1) {
      SteamClient.unlockAchievement("TheWiseOne");
   }
   if (minAgeWisdomLevel >= 5) {
      SteamClient.unlockAchievement("TheGenius");
   }

   if (sizeOf(gs.greatPeople) >= 100) {
      SteamClient.unlockAchievement("GottaCatchEmAll");
   }

   gs.tiles.forEach((tile) => {
      if (!tile.building) {
         ++emptyTiles;
      }
      if (!tile.explored) {
         ++unexploredTiles;
      }
      if (tile.building) {
         if (
            (tile.building.status === "completed" || tile.building.status === "upgrading") &&
            isWorldWonder(tile.building.type)
         ) {
            wonderLevels += tile.building.level - 1;
            ++wonders;
         }
         if (tile.building.level > maxLevel) {
            maxLevel = tile.building.level;
         }
      }
   });

   if (maxLevel >= 40) {
      SteamClient.unlockAchievement("TheGreatUpgrade");
   }

   if (wonders >= 50) {
      SteamClient.unlockAchievement("WonderfulEmpire");
   }

   if (extraGP >= 100) {
      SteamClient.unlockAchievement("Apprentice");
   }
   if (extraGP >= 500) {
      SteamClient.unlockAchievement("Scholar");
   }
   if (extraGP >= 1000) {
      SteamClient.unlockAchievement("Savant");
   }
   if (extraGP >= 1500) {
      SteamClient.unlockAchievement("Professor");
   }
   if (extraGP >= 2000) {
      SteamClient.unlockAchievement("Luminary");
   }
   if (extraGP >= 2500) {
      SteamClient.unlockAchievement("Sage");
   }
   if (extraGP >= 3000) {
      SteamClient.unlockAchievement("Omniscient");
   }

   if (emptyTiles <= 0) {
      SteamClient.unlockAchievement("UrbanPlanner");
   }

   if (unexploredTiles > 0) {
      SteamClient.unlockAchievement("Imperfectionist");
   }

   if (gs.tick >= 60 * 60 * 24) {
      SteamClient.unlockAchievement("EnduringCivilization");
   }

   if (getPermanentGreatPeopleLevel(getGameOptions()) >= 500) {
      SteamClient.unlockAchievement("ThinkTank");
   }

   const eic = findSpecialBuilding("EastIndiaCompany", gs);
   if (eic && eic.building.level >= 10) {
      SteamClient.unlockAchievement("TradeMonopoly");
   }

   const soh = findSpecialBuilding("SydneyOperaHouse", gs);
   if (soh && soh.building.level >= 2) {
      SteamClient.unlockAchievement("MoreTilesMoreFun");
   }

   const ppd = findSpecialBuilding("CentrePompidou", gs);
   if (ppd) {
      const building = ppd.building as ICentrePompidouBuildingData;
      if (building.cities.size >= sizeOf(Config.City)) {
         SteamClient.unlockAchievement("AroundTheWorld");
      }
   }

   if (wonderLevels >= 50) {
      SteamClient.unlockAchievement("CivitasMirabilis");
   }

   const swissBank = findSpecialBuilding("SwissBank", gs);
   if ((swissBank?.building.resources.Koti ?? 0) >= 1_000_000) {
      SteamClient.unlockAchievement("SwissBanker");
   }

   if (Tick.current.totalValue >= 1_000_000_000_000 && gs.tradeValue <= 0) {
      SteamClient.unlockAchievement("Isolationist");
   }

   if (hasFlag(gs.flags, GameStateFlags.HasThreeAllies)) {
      SteamClient.unlockAchievement("TheAlliance");
   }
}
