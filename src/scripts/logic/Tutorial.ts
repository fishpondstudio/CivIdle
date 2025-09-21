import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { isAgeUnlocked } from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { mReduceOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import KeepYourEmpireHappy from "../../videos/KeepYourEmpireHappy.mp4";
import TutorialBuildHouse from "../../videos/TutorialBuildHouse.mp4";
import TutorialBuildHut from "../../videos/TutorialBuildHut.mp4";
import TutorialBuildLoggingCamp from "../../videos/TutorialBuildLoggingCamp.mp4";
import TutorialBuildStatisticsOffice from "../../videos/TutorialBuildStatisticsOffice.mp4";
import TutorialBuildStoneQuarry from "../../videos/TutorialBuildStoneQuarry.mp4";
import TutorialBuildWheatFarm from "../../videos/TutorialBuildWheatFarm.mp4";
import TutorialClaimTradeTile from "../../videos/TutorialClaimTradeTile.mp4";
import TutorialRebirth from "../../videos/TutorialRebirth.mp4";
import TutorialResearch from "../../videos/TutorialResearch.mp4";
import TutorialResearchHousing from "../../videos/TutorialResearchHousing.mp4";
import TutorialSetHousePriority from "../../videos/TutorialSetHousePriority.mp4";
import TutorialUpgrade50Levels from "../../videos/TutorialUpgrade50Levels.mp4";
import TutorialUpgradeAqueduct from "../../videos/TutorialUpgradeAqueduct.mp4";
import TutorialUpgradeHut from "../../videos/TutorialUpgradeHut.mp4";
import { getOwnedTradeTile } from "../scenes/PathFinder";

export interface ITutorial {
   name: () => string;
   desc: () => string;
   progress: (gs: GameState) => [number, number];
   video?: string;
   selector?: string;
}

export const Tutorial: ITutorial[] = [
   {
      name: () => t(L.TutorialBuildXBuildings, { count: 3, building: Config.Building.Hut.name() }),
      desc: () => t(L.TutorialBuildHutsHTML),
      progress: (gs) => {
         return [
            mReduceOf(gs.tiles, (prev, _xy, tile) => prev + (tile.building?.type === "Hut" ? 1 : 0), 0),
            3,
         ];
      },
      video: TutorialBuildHut,
   },
   {
      name: () =>
         t(L.TutorialHaveTotalXLevelsOfBuildings, { count: 15, building: Config.Building.Hut.name() }),
      desc: () => t(L.TutorialUpgradeHutsHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) => prev + (tile.building?.type === "Hut" ? tile.building.level : 0),
               0,
            ),
            15,
         ];
      },
      video: TutorialUpgradeHut,
   },
   {
      name: () => t(L.TutorialBuildXBuildings, { count: 2, building: Config.Building.LoggingCamp.name() }),
      desc: () => t(L.TutorialBuildLoggingCampsHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) => prev + (tile.building?.type === "LoggingCamp" ? 1 : 0),
               0,
            ),
            2,
         ];
      },
      video: TutorialBuildLoggingCamp,
   },
   {
      name: () => t(L.TutorialBuildXBuildings, { count: 2, building: Config.Building.StoneQuarry.name() }),
      desc: () => t(L.TutorialBuildStoneQuarriesHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) => prev + (tile.building?.type === "StoneQuarry" ? 1 : 0),
               0,
            ),
            2,
         ];
      },
      video: TutorialBuildStoneQuarry,
   },
   {
      name: () => t(L.TutorialHaveTotalXLevels, { count: 35 }),
      desc: () => t(L.TutorialUpgrade35LevelsHTML),
      progress: (gs) => {
         return [mReduceOf(gs.tiles, (prev, _xy, tile) => prev + (tile.building?.level ?? 0), 0), 35];
      },
      video: TutorialUpgrade50Levels,
   },
   {
      name: () => t(L.TutorialKeepYourEmpireHappy),
      desc: () => t(L.TutorialHappinessHTML),
      progress: (gs) => {
         return [Tick.current.happiness?.value ?? 0, 0];
      },
      video: KeepYourEmpireHappy,
      selector: "#tutorial-happiness",
   },
   {
      name: () => t(L.TutorialResearchXTech, { tech: Config.Tech.Counting.name() }),
      desc: () => t(L.TutorialResearchCountingHTML),
      progress: (gs) => {
         return [gs.unlockedTech.Counting ? 1 : 0, 1];
      },
      video: TutorialResearch,
      selector: "#tutorial-research-button",
   },
   {
      name: () => t(L.TutorialBuildX, { building: Config.Building.Statistics.name() }),
      desc: () => t(L.TutorialBuildStatisticsOfficeHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) => prev + (tile.building?.type === "Statistics" ? 1 : 0),
               0,
            ),
            1,
         ];
      },
      video: TutorialBuildStatisticsOffice,
   },
   {
      name: () => t(L.TutorialResearchXTech, { tech: Config.Tech.Housing.name() }),
      desc: () => t(L.TutorialResearchHousingHTML),
      progress: (gs) => {
         return [gs.unlockedTech.Housing ? 1 : 0, 1];
      },
      video: TutorialResearchHousing,
      selector: "#tutorial-research-button",
   },
   {
      name: () =>
         t(L.TutorialHaveTotalXLevelsOfBuildings, { count: 15, building: Config.Building.WheatFarm.name() }),
      desc: () => t(L.TutorialBuildWheatFarmHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) => prev + (tile.building?.type === "WheatFarm" ? tile.building.level : 0),
               0,
            ),
            15,
         ];
      },
      video: TutorialBuildWheatFarm,
   },
   {
      name: () =>
         t(L.TutorialHaveTotalXLevelsOfBuildings, { count: 10, building: Config.Building.House.name() }),
      desc: () => t(L.TutorialBuildHouseHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) => prev + (tile.building?.type === "House" ? tile.building.level : 0),
               0,
            ),
            10,
         ];
      },
      video: TutorialBuildHouse,
   },
   {
      name: () => t(L.TutorialSetPriorityToX, { building: Config.Building.House.name(), priority: 10 }),
      desc: () => t(L.TutorialSetHousePriorityHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) =>
                  prev + (tile.building?.type === "House" && tile.building.productionPriority === 10 ? 1 : 0),
               0,
            ),
            mReduceOf(gs.tiles, (prev, _xy, tile) => prev + (tile.building?.type === "House" ? 1 : 0), 0),
         ];
      },
      video: TutorialSetHousePriority,
   },
   {
      name: () =>
         t(L.TutorialHaveTotalXLevelsOfBuildings, { count: 10, building: Config.Building.Aqueduct.name() }),
      desc: () => t(L.TutorialBuildAqueductHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) => prev + (tile.building?.type === "Aqueduct" ? tile.building.level : 0),
               0,
            ),
            10,
         ];
      },
      video: TutorialUpgradeAqueduct,
   },
   {
      name: () => t(L.TutorialResearchXTech, { tech: Config.Tech.Bronze.name() }),
      desc: () => t(L.TutorialResearchBronzeTechHTML),
      progress: (gs) => {
         return [gs.unlockedTech.Bronze ? 1 : 0, 1];
      },
      selector: "#tutorial-research-button",
   },
   {
      name: () => t(L.TutorialBuildXBuildings, { count: 1, building: Config.Building.LumberMill.name() }),
      desc: () => t(L.TutorialBuildLumberMillsHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) => prev + (tile.building?.type === "LumberMill" ? 1 : 0),
               0,
            ),
            1,
         ];
      },
   },
   {
      name: () => t(L.TutorialResearchXTech, { tech: Config.Tech.LandTrade.name() }),
      desc: () => t(L.TutorialResearchLandTradeTechHTML),
      progress: (gs) => {
         return [gs.unlockedTech.LandTrade ? 1 : 0, 1];
      },
      selector: "#tutorial-research-button",
   },
   {
      name: () => t(L.TutorialBuildXBuildings, { count: 1, building: Config.Building.Caravansary.name() }),
      desc: () => t(L.TutorialBuildCaravansaryHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) => prev + (tile.building?.type === "Caravansary" ? 1 : 0),
               0,
            ),
            1,
         ];
      },
   },
   {
      name: () => t(L.TutorialClaimATradeTile),
      desc: () => t(L.TutorialClaimTradeTileHTML),
      progress: (gs) => {
         return [getOwnedTradeTile() ? 1 : 0, 1];
      },
      video: TutorialClaimTradeTile,
   },
   {
      name: () => t(L.TutorialBuildX, { building: Config.Building.PyramidOfGiza.name() }),
      desc: () => t(L.BuildPyramidOfGizaHTML),
      progress: (gs) => {
         return [
            mReduceOf(
               gs.tiles,
               (prev, _xy, tile) => prev + (tile.building?.type === "PyramidOfGiza" ? 1 : 0),
               0,
            ),
            1,
         ];
      },
   },
   {
      name: () => t(L.TutorialEnterClassicalAge),
      desc: () => t(L.TutorialEnterClassicalAgeHTML),
      progress: (gs) => {
         return [isAgeUnlocked("ClassicalAge", gs) ? 1 : 0, 1];
      },
   },
   {
      name: () => t(L.TutorialRebirth),
      desc: () => t(L.TutorialRebirthHTML),
      progress: (gs) => {
         return [0, 1];
      },
      video: TutorialRebirth,
   },
] as const;

export function getCurrentTutorial(gs: GameState): ITutorial | null {
   for (const t of Tutorial) {
      const [progress, total] = t.progress(gs);
      if (progress < total) {
         return t;
      }
   }
   return null;
}
