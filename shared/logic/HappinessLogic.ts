import { clamp, isEmpty, mFilterOf, mReduceOf, reduceOf, sizeOf, sum } from "../utilities/Helper";
import type { PartialTabulate } from "../utilities/TypeDefinitions";
import { L, t } from "../utilities/i18n";
import { isNaturalWonder, isSpecialBuilding, isWorldWonder } from "./BuildingLogic";
import { Config } from "./Config";
import type { GameState } from "./GameState";
import { getTypeBuildings, getXyBuildings } from "./IntraTickCache";
import { getCurrentTechAge } from "./TechLogic";
import { Tick } from "./TickLogic";

export const HappinessNames = {
   fromUnlockedTech: () => t(L.HappinessFromUnlockedTech),
   fromUnlockedAge: () => t(L.HappinessFromUnlockedAge),
   fromBuildingTypes: () => t(L.HappinessFromBuildingTypes),
   fromBuildings: () => t(L.HappinessFromBuilding),
   fromWonders: () => t(L.HappinessFromWonders),
   fromHighestTierBuilding: () => t(L.HappinessFromHighestTierBuilding),
} as const;

type HappinessType = keyof typeof HappinessNames;

export const HAPPINESS_MULTIPLIER = 2;

export function calculateHappiness(gs: GameState) {
   const fromUnlockedTech = sizeOf(gs.unlockedTech);
   const techAge = getCurrentTechAge(gs);
   const buildingsByType = getTypeBuildings(gs);
   let fromUnlockedAge = 0;
   if (techAge) {
      fromUnlockedAge = 10 * (Config.TechAge[techAge].idx + 1);
   }
   let fromBuildings = 0;
   let fromWonders = 0;
   let fromHighestTierBuilding = 0;

   getXyBuildings(gs).forEach((building, xy) => {
      if (building.status !== "completed") {
         return;
      }
      if (!isSpecialBuilding(building.type)) {
         if (!Tick.current.notProducingReasons.has(xy)) {
            const tier = Config.BuildingTier[building.type] ?? 0;
            if (tier > fromHighestTierBuilding) {
               fromHighestTierBuilding = tier;
            }
         }
         if (building.capacity <= 0 && Tick.current.specialBuildings.has("HagiaSophia")) {
            // Do nothing
         } else if (Tick.current.happinessExemptions.has(xy)) {
            // Do nothing
         } else {
            ++fromBuildings;
         }
      }
      if (isWorldWonder(building.type)) {
         ++fromWonders;
      }
      if (isNaturalWonder(building.type) && gs.tiles.get(xy)!.explored) {
         ++fromWonders;
      }
   });
   const fromBuildingTypes = mReduceOf(
      buildingsByType,
      (prev, _, value) => {
         return isEmpty(
            mFilterOf(value, (xy, tile) => {
               return (
                  !isSpecialBuilding(tile.building.type) &&
                  (!Tick.current.notProducingReasons.has(xy) ||
                     Tick.current.notProducingReasons.get(xy) === "StorageFull" ||
                     Tick.current.notProducingReasons.get(xy) === "NotEnoughWorkers") &&
                  tile.building.status === "completed"
               );
            }),
         )
            ? prev
            : prev + 1;
      },
      0,
   );
   const positive: PartialTabulate<HappinessType> = {
      fromUnlockedTech,
      fromUnlockedAge,
      fromWonders,
      fromBuildingTypes,
      fromHighestTierBuilding,
   };
   const negative: PartialTabulate<HappinessType> = { fromBuildings };
   const rawValue =
      reduceOf(positive, (prev, _, value) => prev + value, 0) +
      sum(Tick.current.globalMultipliers.happiness, "value") -
      reduceOf(negative, (prev, _, value) => prev + value, 0);
   const value = clamp(rawValue, -50, 50);
   const workerPercentage = (100 + value * HAPPINESS_MULTIPLIER) / 100;
   const normalized = (value + 50) / 100;
   return {
      positive,
      negative,
      rawValue,
      value,
      normalized,
      workerPercentage,
   };
}

export function getHappinessIcon(value: number): string {
   if (value < -30) {
      return "sentiment_extremely_dissatisfied";
   }
   if (value < -10) {
      return "sentiment_dissatisfied";
   }
   if (value < 10) {
      return "sentiment_neutral";
   }
   if (value < 30) {
      return "sentiment_satisfied";
   }
   return "sentiment_very_satisfied";
}
