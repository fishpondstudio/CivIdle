import { GreatPersonType } from "../../../shared/definitions/GreatPersonDefinitions";
import { PatchNotes } from "../../../shared/definitions/PatchNotes";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { STEAM_PATCH_NOTES_URL } from "../../../shared/logic/Constants";
import type { GameOptions, GameState } from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { getResourceIO } from "../../../shared/logic/IntraTickCache";
import { getVotingTime } from "../../../shared/logic/PlayerTradeLogic";
import {
   getGreatPersonUpgradeCost,
   getMissingGreatPeopleForWisdom,
} from "../../../shared/logic/RebirthLogic";
import { getResourceAmount } from "../../../shared/logic/ResourceLogic";
import { getScienceAmount, getTechUnlockCost, unlockableTechs } from "../../../shared/logic/TechLogic";
import { NotProducingReason, Tick } from "../../../shared/logic/TickLogic";
import {
   entriesOf,
   formatHMS,
   formatNumber,
   HOUR,
   mapCount,
   tileToPoint,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { saveGame } from "../Global";
import { isConnected } from "../rpc/RPCClient";
import { isSteam, SteamClient } from "../rpc/SteamClient";
import { getOwnedTradeTile } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { hideModal, showModal, showToast } from "../ui/GlobalModal";
import { ManageAgeWisdomModal } from "../ui/ManageAgeWisdomModal";
import { ManagePermanentGreatPersonModal } from "../ui/ManagePermanentGreatPersonModal";
import { PendingClaimModal } from "../ui/PendingClaimModal";
import { html } from "../ui/RenderHTMLComponent";
import { TilePage } from "../ui/TilePage";
import { openUrl } from "../utilities/Platform";
import { Singleton } from "../utilities/Singleton";
import { playClick } from "../visuals/Sound";
import { PendingClaims } from "./PendingClaim";
import { getBuildNumber, getVersion } from "./Version";

export interface ITodo {
   name: () => string;
   icon: string;
   className: string;
   desc: (gs: GameState, options: GameOptions) => React.ReactNode;
   value?: (gs: GameState, options: GameOptions) => number;
   condition: (gs: GameState, options: GameOptions) => boolean;
   onClick: (gs: GameState, options: GameOptions) => void;
   maxWidth?: string | number;
}

export const _Todos = {
   E1: {
      name: () => t(L.HappinessTooLow),
      icon: "sentiment_dissatisfied",
      className: "text-red",
      desc: (gs, options) => html(t(L.HappinessTooLowHTML)),
      condition: (gs) => (Tick.current.happiness?.value ?? 0) < -25,
      onClick: (gs, options) => {
         const xy = Tick.current.specialBuildings.get("Headquarter")?.tile;
         if (xy) {
            Singleton().sceneManager.getCurrent(WorldScene)?.lookAtTile(xy, LookAtMode.Select);
            Singleton().routeTo(TilePage, { xy, expandHappiness: true });
         }
      },
   },
   E2: {
      name: () => t(L.MoreWorkersNeeded),
      icon: "engineering",
      className: "text-red",
      desc: (gs, options) =>
         html(
            t(L.MoreWorkersNeededHTML, {
               count: mapCount(
                  Tick.current.notProducingReasons,
                  (v) => v === NotProducingReason.NotEnoughWorkers,
               ),
            }),
         ),
      condition: (gs) => {
         for (const [xy, reason] of Tick.current.notProducingReasons) {
            if (reason === NotProducingReason.NotEnoughWorkers) {
               return true;
            }
         }
         return false;
      },
      value: (gs, options) => {
         return mapCount(Tick.current.notProducingReasons, (v) => v === NotProducingReason.NotEnoughWorkers);
      },
      onClick: (gs, options) => {
         Singleton()
            .sceneManager.getCurrent(WorldScene)
            ?.drawSelection(
               null,
               Array.from(Tick.current.notProducingReasons.entries()).flatMap(([xy, reason]) =>
                  reason === NotProducingReason.NotEnoughWorkers ? [xy] : [],
               ),
            );
      },
   },
   E3: {
      name: () => t(L.MoreResourceNeeded),
      icon: "production_quantity_limits",
      className: "text-red",
      desc: (gs, options) =>
         html(
            t(L.MoreResourceNeededHTML, {
               count: mapCount(
                  Tick.current.notProducingReasons,
                  (v) => v === NotProducingReason.NotEnoughResources,
               ),
            }),
         ),
      condition: (gs) => {
         for (const [xy, reason] of Tick.current.notProducingReasons) {
            if (reason === NotProducingReason.NotEnoughResources) {
               return true;
            }
         }
         return false;
      },
      value: (gs, options) => {
         return mapCount(
            Tick.current.notProducingReasons,
            (v) => v === NotProducingReason.NotEnoughResources,
         );
      },
      onClick: (gs, options) => {
         Singleton()
            .sceneManager.getCurrent(WorldScene)
            ?.drawSelection(
               null,
               Array.from(Tick.current.notProducingReasons.entries()).flatMap(([xy, reason]) =>
                  reason === NotProducingReason.NotEnoughResources ? [xy] : [],
               ),
            );
      },
   },
   E4: {
      name: () => t(L.TileNotPowered),
      icon: "electrical_services",
      className: "text-red",
      desc: (gs, options) =>
         html(
            t(L.TileNotPoweredHTML, {
               count: mapCount(Tick.current.notProducingReasons, (v) => v === NotProducingReason.NoPower),
            }),
         ),
      condition: (gs) => {
         for (const [xy, reason] of Tick.current.notProducingReasons) {
            if (reason === NotProducingReason.NoPower) {
               return true;
            }
         }
         return false;
      },
      value: (gs, options) => {
         return mapCount(Tick.current.notProducingReasons, (v) => v === NotProducingReason.NoPower);
      },
      onClick: (gs, options) => {
         Singleton()
            .sceneManager.getCurrent(WorldScene)
            ?.drawSelection(
               null,
               Array.from(Tick.current.notProducingReasons.entries()).flatMap(([xy, reason]) =>
                  reason === NotProducingReason.NoPower ? [xy] : [],
               ),
            );
      },
   },
   E5: {
      name: () => t(L.YouAreOffline),
      icon: "wifi_off",
      className: "text-red",
      desc: (gs, options) => html(t(L.YouAreOfflineHTML)),
      condition: (gs) => !isConnected(),
      onClick: (gs, options) => {
         saveGame().then(() => window.location.reload());
      },
   },
   W1: {
      name: () => t(L.BuildingsStorageFull),
      icon: "storage",
      className: "text-orange",
      desc: (gs, options) =>
         html(
            t(L.BuildingsStorageFullHTML, {
               count: mapCount(Tick.current.notProducingReasons, (v) => v === NotProducingReason.StorageFull),
            }),
         ),
      condition: (gs) => {
         for (const [xy, reason] of Tick.current.notProducingReasons) {
            if (reason === NotProducingReason.StorageFull) {
               return true;
            }
         }
         return false;
      },
      value: (gs, options) => {
         return mapCount(Tick.current.notProducingReasons, (v) => v === NotProducingReason.StorageFull);
      },
      onClick: (gs, options) => {
         Singleton()
            .sceneManager.getCurrent(WorldScene)
            ?.drawSelection(
               null,
               Array.from(Tick.current.notProducingReasons.entries()).flatMap(([xy, reason]) =>
                  reason === NotProducingReason.StorageFull ? [xy] : [],
               ),
            );
      },
   },
   W2: {
      name: () => t(L.BuildingsTurnedOff),
      icon: "motion_photos_off",
      className: "text-orange",
      desc: (gs, options) =>
         html(
            t(L.BuildingsTurnedOffHTML, {
               count: mapCount(Tick.current.notProducingReasons, (v) => v === NotProducingReason.TurnedOff),
            }),
         ),
      condition: (gs) => {
         for (const [xy, reason] of Tick.current.notProducingReasons) {
            if (reason === NotProducingReason.TurnedOff) {
               return true;
            }
         }
         return false;
      },
      value: (gs, options) => {
         return mapCount(Tick.current.notProducingReasons, (v) => v === NotProducingReason.TurnedOff);
      },
      onClick: (gs, options) => {
         Singleton()
            .sceneManager.getCurrent(WorldScene)
            ?.drawSelection(
               null,
               Array.from(Tick.current.notProducingReasons.entries()).flatMap(([xy, reason]) =>
                  reason === NotProducingReason.TurnedOff ? [xy] : [],
               ),
            );
      },
   },
   W4: {
      name: () => t(L.NotEnoughPower),
      icon: "power_off",
      className: "text-orange",
      desc: (gs, options) =>
         html(
            t(L.NotEnoughPowerHTML, {
               count: Tick.current.notEnoughPower.size,
            }),
         ),
      condition: (gs) => {
         return Tick.current.notEnoughPower.size > 0;
      },
      value: (gs, options) => {
         return Tick.current.notEnoughPower.size;
      },
      onClick: (gs, options) => {
         Singleton()
            .sceneManager.getCurrent(WorldScene)
            ?.drawSelection(null, Array.from(Tick.current.notEnoughPower));
      },
   },
   W3: {
      name: () => t(L.TradeTileBonusWillRefresh),
      icon: "access_time",
      className: "text-orange",
      desc: (gs, options) =>
         html(
            t(L.TradeTileBonusWillRefreshHTML, {
               time: formatHMS(getVotingTime()),
            }),
         ),
      condition: (gs) => {
         return getVotingTime() <= 8 * HOUR;
      },
      onClick: (gs, options) => {
         playClick();
         if (getOwnedTradeTile()) {
            Singleton().sceneManager.loadScene(PlayerMapScene);
         } else {
            showToast(t(L.PlayerTradeClaimTileFirstWarning));
         }
      },
   },
   W5: {
      name: () => t(L.DeficitResources),
      icon: "do_not_disturb_on",
      className: "text-orange",
      desc: (gs, options) => {
         const deficit = new Map<Resource, number>();
         const { theoreticalInput, theoreticalOutput } = getResourceIO(gs);
         theoreticalInput.forEach((input, res) => {
            const diff = (theoreticalOutput.get(res) ?? 0) - input;
            if (diff < 0) {
               deficit.set(res, diff);
            }
         });
         return (
            <>
               <table className="date-table" style={{ minWidth: 250 }}>
                  <thead>
                     <tr>
                        <th className="text-left">{t(L.Resource)}</th>
                        <th className="text-right">{t(L.StatisticsResourcesDeficit)}</th>
                        <th className="text-right">{t(L.StatisticsResourcesRunOut)}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {Array.from(deficit)
                        .sort(([a, amountA], [b, amountB]) => {
                           return getResourceAmount(b) / amountB - getResourceAmount(a) / amountA;
                        })
                        .map(([res, amount]) => {
                           const runOutIn = formatHMS((1000 * getResourceAmount(res)) / Math.abs(amount));
                           return (
                              <tr key={res}>
                                 <td>{Config.Resource[res].name()}</td>
                                 <td className="text-right">{formatNumber(amount)}</td>
                                 <td className="text-right">{runOutIn}</td>
                              </tr>
                           );
                        })}
                  </tbody>
               </table>
            </>
         );
      },
      condition: (gs) => {
         const { theoreticalInput, theoreticalOutput } = getResourceIO(gs);
         for (const [res, input] of theoreticalInput) {
            const diff = (theoreticalOutput.get(res) ?? 0) - input;
            if (diff < 0) {
               return true;
            }
         }
         return false;
      },
      value: (gs, options) => {
         let deficit = 0;
         const { theoreticalInput, theoreticalOutput } = getResourceIO(gs);
         theoreticalInput.forEach((input, res) => {
            const diff = (theoreticalOutput.get(res) ?? 0) - input;
            if (diff < 0) {
               ++deficit;
            }
         });
         return deficit;
      },
      onClick: (gs, options) => {
         const s = Tick.current.specialBuildings.get("Statistics");
         if (s) {
            Singleton()
               .sceneManager.getCurrent(WorldScene)
               ?.selectGrid(tileToPoint(s.tile), { tab: "resources" });
         }
      },
   },
   I1: {
      name: () => t(L.UnlockableTech),
      icon: "tips_and_updates",
      className: "text-green",
      desc: (gs) => {
         const science = getScienceAmount(gs);
         const techs = unlockableTechs(gs)
            .flatMap((tech) => (science >= getTechUnlockCost(tech) ? [Config.Tech[tech].name()] : []))
            .join(", ");
         return html(t(L.UnlockableTechHTML, { techs }));
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
   I2: {
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
         return html(t(L.UpgradeablePermanentGreatPeopleHTML, { gps }));
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
   I3: {
      name: () => t(L.UnclaimedGreatPeopleThisRun),
      icon: "person_4",
      className: "text-green",
      desc: (gs, options) => {
         return html(t(L.UnclaimedGreatPeopleThisRunHTML, { count: gs.greatPeopleChoicesV2.length }));
      },
      condition: (gs, options) => gs.greatPeopleChoicesV2.length > 0,
      onClick: (gs, options) => {
         if (gs.greatPeopleChoicesV2.length > 0) {
            showModal(<ChooseGreatPersonModal permanent={false} />);
         }
      },
   },
   I4: {
      name: () => t(L.UnclaimedPermanentGreatPeople),
      icon: "supervisor_account",
      className: "text-green",
      desc: (gs, options) => {
         return html(t(L.UnclaimedPermanentGreatPeopleHTML, { count: options.greatPeopleChoicesV2.length }));
      },
      condition: (gs, options) => options.greatPeopleChoicesV2.length > 0,
      onClick: (gs, options) => {
         if (options.greatPeopleChoicesV2.length > 0) {
            showModal(<ChooseGreatPersonModal permanent={true} />);
         }
      },
   },
   I5: {
      name: () => t(L.UpgradeableAgeWisdom),
      icon: "emoji_objects",
      className: "text-green",
      desc: (gs, options) => {
         return html(t(L.UpgradeableAgeWisdomHTML, { count: gs.greatPeopleChoicesV2.length }));
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
   I6: {
      name: () => t(L.TradeSCanBeClaimed),
      icon: "currency_exchange",
      className: "text-green",
      desc: (gs, options) => {
         return html(t(L.TradesCanBeClaimedHTML, { count: PendingClaims.length }));
      },
      value: (gs, options) => {
         return PendingClaims.length;
      },
      condition: (gs, options) => {
         return PendingClaims.length > 0;
      },
      onClick: (gs, options) => {
         showModal(<PendingClaimModal hideModal={hideModal} />);
      },
   },
   I7: {
      name: () => t(L.WatchedResources),
      icon: "visibility",
      className: "text-green",
      maxWidth: "50vw",
      value: (gs, options) => {
         return gs.watchedResources.size;
      },
      desc: (gs, options) => {
         const { theoreticalInput, theoreticalOutput } = getResourceIO(gs);
         return (
            <>
               <table className="date-table">
                  <thead>
                     <tr>
                        <th className="text-left">{t(L.Resource)}</th>
                        <th className="text-right">{t(L.Produced)}</th>
                        <th className="text-right">{t(L.Consumed)}</th>
                        <th className="text-right">{t(L.Surplus)}</th>
                        <th className="text-right">{t(L.StatisticsResourcesRunOut)}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {Array.from(gs.watchedResources).map((res) => {
                        const produced = theoreticalOutput.get(res) ?? 0;
                        const consumed = theoreticalInput.get(res) ?? 0;
                        const surplus = produced - consumed;
                        const runOutIn = formatHMS(
                           surplus > 0
                              ? Number.POSITIVE_INFINITY
                              : (1000 * getResourceAmount(res)) / Math.abs(surplus),
                        );
                        return (
                           <tr key={res}>
                              <td>{Config.Resource[res].name()}</td>
                              <td className="text-right">{formatNumber(produced)}</td>
                              <td className="text-right">{formatNumber(consumed)}</td>
                              <td className="text-right">{formatNumber(surplus)}</td>
                              <td className="text-right">{runOutIn}</td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </>
         );
      },
      condition: (gs, options) => {
         return gs.watchedResources.size > 0;
      },
      onClick: (gs, options) => {
         const s = Tick.current.specialBuildings.get("Statistics");
         if (s) {
            Singleton()
               .sceneManager.getCurrent(WorldScene)
               ?.selectGrid(tileToPoint(s.tile), { tab: "resources" });
         }
      },
   },
   S1: {
      name: () => t(L.ReadFullPatchNotes),
      icon: "browser_updated",
      className: "text-blue",
      desc: (gs, options) => {
         return html(t(L.ReadPatchNotesHTMLV2, { version: getVersion(), build: getBuildNumber() }));
      },
      condition: (gs, options) => options.buildNumber !== getBuildNumber(),
      onClick: (gs, options) => {
         options.buildNumber = getBuildNumber();
         notifyGameOptionsUpdate();
         if (isSteam()) {
            SteamClient.unlockAchievement("PatchNotesReader");
         }
         const patchNote = PatchNotes[0];
         const link = patchNote.link;
         if (link) {
            openUrl(link);
            return;
         }
         openUrl(STEAM_PATCH_NOTES_URL);
      },
   },
} as const satisfies Record<string, ITodo>;

export type Todo = keyof typeof _Todos;
export const Todo: Record<Todo, ITodo> = _Todos;
