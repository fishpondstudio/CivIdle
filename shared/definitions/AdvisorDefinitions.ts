import type { GameState } from "../logic/GameState";
import { getCurrentAge } from "../logic/TechLogic";
import { NotProducingReason, Tick } from "../logic/TickLogic";
import { deepFreeze } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";

export interface IAdvisor {
   title: string;
   content: string;
   condition: (gs: GameState) => boolean;
}

export const Advisors = deepFreeze({
   Happiness: {
      title: t(L.AdvisorHappinessTitle),
      content: t(L.AdvisorHappinessContent),
      condition: (gs) => (Tick.current.happiness?.value ?? Number.POSITIVE_INFINITY) <= 5,
   },
   Wonder: {
      title: t(L.AdvisorWonderTitle),
      content: t(L.AdvisorWonderContent),
      condition: (gs) => !!gs.unlockedTech.Masonry,
   },
   Science: {
      title: t(L.AdvisorScienceTitle),
      content: t(L.AdvisorScienceContent),
      condition: (gs) => {
         const hq = Tick.current.specialBuildings.get("Headquarter");
         return (hq?.building.resources.Science ?? 0) >= 25_000;
      },
   },
   Worker: {
      title: t(L.AdvisorWorkerTitle),
      content: t(L.AdvisorWorkerContent),
      condition: (gs) => {
         for (const [k, v] of Tick.current.notProducingReasons) {
            return v === NotProducingReason.NotEnoughWorkers;
         }
         return false;
      },
   },
   Storage: {
      title: t(L.AdvisorStorageTitle),
      content: t(L.AdvisorStorageContent),
      condition: (gs) => {
         for (const [k, v] of Tick.current.notProducingReasons) {
            return v === NotProducingReason.StorageFull;
         }
         return false;
      },
   },
   Tradition: {
      title: t(L.AdvisorTraditionTitle),
      content: t(L.AdvisorTraditionContent),
      condition: (gs) => {
         return (
            Tick.current.specialBuildings.has("ChoghaZanbil") ||
            Tick.current.specialBuildings.has("LuxorTemple") ||
            Tick.current.specialBuildings.has("BigBen")
         );
      },
   },
   Electricity: {
      title: t(L.AdvisorElectricityTitle),
      content: t(L.AdvisorElectricityContent),
      condition: (gs) => !!gs.unlockedTech.Electricity,
   },
   GreatPeople: {
      title: t(L.AdvisorGreatPeopleTitle),
      content: t(L.AdvisorGreatPeopleContent),
      condition: (gs) => getCurrentAge(gs) === "BronzeAge",
   },
}) satisfies Record<string, IAdvisor>;

export type Advisor = keyof typeof Advisors;
