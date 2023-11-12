import { PartialTabulate } from "../definitions/TypeDefinitions";
import { clamp, filterOf, forEach, isEmpty, reduceOf, sizeOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { isNaturalWonder, isSpecialBuilding, isWorldWonder } from "./BuildingLogic";
import { Config } from "./Constants";
import { GameState } from "./GameState";
import { getTypeBuildings, getXyBuildings } from "./IntraTickCache";
import { getCurrentTechAge } from "./TechLogic";
import { Tick } from "./TickLogic";

export const HappinessNames = {
   fromUnlockedTech: () => t(L.HappinessFromUnlockedTech),
   fromUnlockedAge: () => t(L.HappinessFromUnlockedAge),
   fromBuildingTypes: () => t(L.HappinessFromBuildingTypes),
   fromBuildings: () => t(L.HappinessFromBuilding),
   fromWonders: () => t(L.HappinessFromWonders),
} as const;

type HappinessType = keyof typeof HappinessNames;

export const HAPPINESS_MULTIPLIER = 2;

export function calculateHappiness(gs: GameState) {
   const fromUnlockedTech = sizeOf(gs.unlockedTech);
   const techAge = getCurrentTechAge(gs);
   let fromUnlockedAge = 0;
   if (techAge) {
      fromUnlockedAge = 5 * (Config.TechAge[techAge].idx + 1);
   }
   let fromBuildings = 0;
   let fromWonders = 0;
   forEach(getXyBuildings(gs), (xy, building) => {
      if (building.status === "completed" && !isSpecialBuilding(building.type)) {
         ++fromBuildings;
      }
      if (isWorldWonder(building.type)) {
         ++fromWonders;
      }
      if (isNaturalWonder(building.type) && gs.tiles[xy].explored) {
         ++fromWonders;
      }
   });
   const fromBuildingTypes = reduceOf(
      getTypeBuildings(gs),
      (prev, _, value) => {
         return isEmpty(
            filterOf(value, (xy, tile) => {
               return (
                  !isSpecialBuilding(tile.building.type) &&
                  !Tick.current.notProducingReasons[xy] &&
                  tile.building.status === "completed"
               );
            })
         )
            ? prev
            : prev + 1;
      },
      0
   );
   const positive: PartialTabulate<HappinessType> = {
      fromUnlockedTech,
      fromUnlockedAge,
      fromWonders,
      fromBuildingTypes,
   };
   const negative: PartialTabulate<HappinessType> = { fromBuildings };
   const value = clamp(
      reduceOf(positive, (prev, _, value) => prev + value, 0) - reduceOf(negative, (prev, _, value) => prev + value, 0),
      -50,
      50
   );
   const workerPercentage = (100 + value * HAPPINESS_MULTIPLIER) / 100;
   const normalized = (value + 50) / 100;
   return {
      positive,
      negative,
      value,
      normalized,
      workerPercentage,
   };
}
