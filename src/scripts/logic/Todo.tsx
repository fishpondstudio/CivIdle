import { GreatPersonType } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { GameOptions, GameState } from "../../../shared/logic/GameState";
import {
   getGreatPersonUpgradeCost,
   getMissingGreatPeopleForWisdom,
} from "../../../shared/logic/RebirthLogic";
import { getScienceAmount, getTechUnlockCost, unlockableTechs } from "../../../shared/logic/TechLogic";
import { NotProducingReason, Tick } from "../../../shared/logic/TickLogic";
import { entriesOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { showModal } from "../ui/GlobalModal";
import { ManageAgeWisdomModal } from "../ui/ManageAgeWisdomModal";
import { ManagePermanentGreatPersonModal } from "../ui/ManagePermanentGreatPersonModal";
import { TilePage } from "../ui/TilePage";
import { Singleton } from "../utilities/Singleton";

export interface ITodo {
   name: () => string;
   icon: string;
   className: string;
   desc: (gs: GameState, options: GameOptions) => string;
   condition: (gs: GameState, options: GameOptions) => boolean;
   onClick: (gs: GameState, options: GameOptions) => void;
}

export const _Todos = {
   T1: {
      name: () => t(L.HappinessTooLow),
      icon: "sentiment_dissatisfied",
      className: "text-red",
      desc: (gs, options) => t(L.HappinessTooLowHTML),
      condition: (gs) => (Tick.current.happiness?.value ?? 0) < -25,
      onClick: (gs, options) => {
         const xy = Tick.current.specialBuildings.get("Headquarter")?.tile;
         if (xy) {
            Singleton().sceneManager.getCurrent(WorldScene)?.lookAtTile(xy, LookAtMode.Select);
            Singleton().routeTo(TilePage, { xy, expandHappiness: true });
         }
      },
   },
   T2: {
      name: () => t(L.MoreWorkersNeeded),
      icon: "engineering",
      className: "text-red",
      desc: (gs, options) => t(L.MoreWorkersNeededHTML),
      condition: (gs) => {
         for (const [xy, reason] of Tick.current.notProducingReasons) {
            if (reason === NotProducingReason.NotEnoughWorkers) {
               return true;
            }
         }
         return false;
      },
      onClick: (gs, options) => {},
   },
   T3: {
      name: () => t(L.UnlockableTech),
      icon: "tips_and_updates",
      className: "text-green",
      desc: (gs) => {
         const science = getScienceAmount(gs);
         const techs = unlockableTechs(gs)
            .flatMap((tech) => (science >= getTechUnlockCost(tech) ? [Config.Tech[tech].name()] : []))
            .join(", ");
         return t(L.UnlockableTechHTML, { techs });
      },
      condition: (gs) => {
         const techs = unlockableTechs(gs);
         const science = getScienceAmount(gs);
         return techs.some((tech) => science >= getTechUnlockCost(tech));
      },
      onClick: (gs, options) => {
         Singleton().sceneManager.loadScene(TechTreeScene);
      },
   },
   T4: {
      name: () => t(L.UpgradeablePermanentGreatPeople),
      icon: "person_celebrate",
      className: "text-green",
      desc: (gs, options) => {
         const gps = entriesOf(options.greatPeople)
            .flatMap(([gp, inv]) =>
               Config.GreatPerson[gp].type === GreatPersonType.Normal &&
               inv.amount >= getGreatPersonUpgradeCost(gp, inv.level + 1)
                  ? [Config.GreatPerson[gp].name()]
                  : [],
            )
            .join(", ");
         return t(L.UpgradeablePermanentGreatPeopleHTML, { gps });
      },
      condition: (gs, options) =>
         entriesOf(options.greatPeople).some(
            ([gp, inv]) =>
               Config.GreatPerson[gp].type === GreatPersonType.Normal &&
               inv.amount >= getGreatPersonUpgradeCost(gp, inv.level + 1),
         ),
      onClick: (gs, options) => {
         showModal(<ManagePermanentGreatPersonModal />);
      },
   },
   T5: {
      name: () => t(L.UnclaimedGreatPeopleThisRun),
      icon: "person_4",
      className: "text-green",
      desc: (gs, options) => {
         return t(L.UnclaimedGreatPeopleThisRunHTML, { count: gs.greatPeopleChoicesV2.length });
      },
      condition: (gs, options) => gs.greatPeopleChoicesV2.length > 0,
      onClick: (gs, options) => {
         if (gs.greatPeopleChoicesV2.length > 0) {
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
      },
   },
   T6: {
      name: () => t(L.UnclaimedPermanentGreatPeople),
      icon: "supervisor_account",
      className: "text-green",
      desc: (gs, options) => {
         return t(L.UnclaimedPermanentGreatPeopleHTML, { count: options.greatPeopleChoicesV2.length });
      },
      condition: (gs, options) => options.greatPeopleChoicesV2.length > 0,
      onClick: (gs, options) => {
         if (options.greatPeopleChoicesV2.length > 0) {
            showModal(<ChooseGreatPersonModal permanent={true} />);
         }
      },
   },
   T7: {
      name: () => t(L.UpgradeableAgeWisdom),
      icon: "emoji_objects",
      className: "text-green",
      desc: (gs, options) => {
         return t(L.UpgradeableAgeWisdomHTML, { count: gs.greatPeopleChoicesV2.length });
      },
      condition: (gs, options) => {
         for (const [age] of entriesOf(Config.TechAge)) {
            if (age === "BronzeAge") {
               continue;
            }
            if (getMissingGreatPeopleForWisdom(age).size <= 0) {
               return false;
            }
         }
         return true;
      },
      onClick: (gs, options) => {
         if (gs.greatPeopleChoicesV2.length > 0) {
            showModal(<ManageAgeWisdomModal />);
         }
      },
   },
} as const satisfies Record<string, ITodo>;

export type Todo = keyof typeof _Todos;
export const Todo: Record<Todo, ITodo> = _Todos;
