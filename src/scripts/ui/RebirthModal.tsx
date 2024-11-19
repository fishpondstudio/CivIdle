import { useEffect, useState } from "react";
import type { City } from "../../../shared/definitions/CityDefinitions";
import { getBuildingDescription, getMultipliersDescription } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import {
   getFreeCityThisWeek,
   getGreatPeopleChoiceCount,
   getPermanentGreatPeopleLevel,
   getRebirthGreatPeopleCount,
   makeGreatPeopleFromThisRunPermanent,
   rollPermanentGreatPeople,
} from "../../../shared/logic/RebirthLogic";
import { getCurrentAge } from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { UserAttributes } from "../../../shared/utilities/Database";
import {
   clamp,
   formatPercent,
   hasFlag,
   isEmpty,
   mapOf,
   range,
   reduceOf,
   rejectIn,
   safeParseInt,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { resetToCity, saveGame, useGameState } from "../Global";
import { checkRebirthAchievements } from "../logic/Achievement";
import { canEarnGreatPeopleFromReborn, client, isOnlineUser, useTrades, useUser } from "../rpc/RPCClient";
import { jsxMapOf } from "../utilities/Helper";
import { playClick, playError } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { WarningComponent } from "./WarningComponent";

export function RebirthModal(): React.ReactNode {
   const trades = useTrades();
   const user = useUser();
   const [tradeCount, setTradeCount] = useState<number>(
      trades.filter((t) => t.fromId === user?.userId).length,
   );
   useEffect(() => {
      client.getPendingClaims().then((c) => setTradeCount((old) => old + c.length));
   }, []);

   const gs = useGameState();
   const [city, setCity] = useState<City>(gs.city);
   const permanentGreatPeopleLevel = getPermanentGreatPeopleLevel(getGameOptions());
   const greatPeopleAtRebirthCount = getRebirthGreatPeopleCount();

   const hasSupporterPack = () => {
      if (import.meta.env.DEV) {
         return true;
      }
      if (Config.City[city].requireSupporterPack) {
         return (
            hasFlag(user?.attr ?? UserAttributes.None, UserAttributes.DLC1) || getFreeCityThisWeek() === city
         );
      }
      return true;
   };

   const maxPickPerRoll = clamp(
      Math.floor(clamp(greatPeopleAtRebirthCount - gs.claimedGreatPeople, 0, Number.POSITIVE_INFINITY) / 50),
      1,
      Number.POSITIVE_INFINITY,
   );
   const [pickPerRoll, setPickPerRoll] = useState(maxPickPerRoll);

   return (
      <div className="window" style={{ width: "700px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Reborn)}</div>
         </div>
         <div className="window-body" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            {tradeCount > 0 ? (
               <WarningComponent icon="warning" className="mb10 text-small">
                  <RenderHTML html={t(L.RebornTradeWarning)} />
               </WarningComponent>
            ) : null}
            <WarningComponent icon="info" className="mb10 text-small">
               <RenderHTML html={t(L.RebornModalDescV3)} />
            </WarningComponent>
            {canEarnGreatPeopleFromReborn() ? (
               <ul className="tree-view">
                  <li className="row">
                     <div className="f1">{t(L.GreatPeopleThisRun)}</div>
                     <div className="text-strong">
                        {reduceOf(
                           gs.greatPeople,
                           (prev, k, v) => {
                              return prev + v;
                           },
                           0,
                        )}
                     </div>
                  </li>
                  <li className="row">
                     <div className="f1">{t(L.TotalEmpireValue)}</div>
                     <div className="text-strong">
                        <FormatNumber value={Tick.current.totalValue} />
                     </div>
                  </li>
                  <li className="row">
                     <div className="f1">{t(L.ExtraGreatPeopleAtReborn)}</div>
                     <div className="text-strong">
                        <TextWithHelp
                           content={t(L.ClaimedGreatPeopleTooltip, {
                              total: greatPeopleAtRebirthCount,
                              claimed: gs.claimedGreatPeople,
                           })}
                        >
                           {clamp(
                              greatPeopleAtRebirthCount - gs.claimedGreatPeople,
                              0,
                              Number.POSITIVE_INFINITY,
                           )}
                        </TextWithHelp>
                     </div>
                  </li>
                  <ul>
                     <li className="row">
                        <div className="f1">{t(L.ClaimedGreatPeople)}</div>
                        <div className="text-strong">{gs.claimedGreatPeople}</div>
                     </li>
                  </ul>
               </ul>
            ) : (
               <WarningComponent icon="warning">{t(L.CannotEarnPermanentGreatPeopleDesc)}</WarningComponent>
            )}
            <div className="sep10" />
            <fieldset>
               <div className="row">
                  <div className="f1">{t(L.GreatPeoplePickPerRoll)}</div>
                  <select
                     value={pickPerRoll}
                     onChange={(e) => {
                        setPickPerRoll(clamp(safeParseInt(e.target.value, 1), 1, maxPickPerRoll));
                     }}
                  >
                     {range(1, maxPickPerRoll + 1).map((i) => (
                        <option key={i} value={i}>
                           {i}
                        </option>
                     ))}
                  </select>
               </div>
            </fieldset>
            <fieldset>
               {hasFlag(user?.attr ?? UserAttributes.None, UserAttributes.DLC1) ? null : (
                  <WarningComponent icon="info" className="text-small mb10">
                     <RenderHTML
                        html={t(L.FreeThisWeekDescHTMLV2, {
                           city: Config.City[getFreeCityThisWeek()].name(),
                        })}
                     />
                  </WarningComponent>
               )}
               <div className="row">
                  <div className="f1">{t(L.SelectCivilization)}</div>
                  <select
                     value={city}
                     onChange={(e) => {
                        setCity(e.target.value as City);
                     }}
                  >
                     {jsxMapOf(Config.City, (city, def) => {
                        return (
                           <option key={city} value={city}>
                              {def.name()}
                              {def.requireSupporterPack ? "*" : ""}
                           </option>
                        );
                     })}
                  </select>
               </div>
               <div className="separator"></div>
               <div className="row">
                  <div className="text-strong">{t(L.Deposit)}</div>
                  <div className="text-desc ml5">
                     ({Config.City[city].size}x{Config.City[city].size})
                  </div>
               </div>
               <div className="mb5">
                  {mapOf(Config.City[city].deposits, (dep, value) => {
                     return `${Config.Resource[dep].name()}: ${formatPercent(value)}`;
                  }).join(", ")}
               </div>
               <div className="text-strong">{t(L.UniqueBuildings)}</div>
               <div className="mb5">
                  {jsxMapOf(Config.City[city].uniqueBuildings, (building, tech) => {
                     return (
                        <TextWithHelp
                           className="mr10"
                           key={building}
                           content={getBuildingDescription(building)}
                        >
                           {Config.Building[building].name()}{" "}
                           <span className="text-desc">({Config.Tech[tech].name()})</span>
                        </TextWithHelp>
                     );
                  })}
               </div>
               <div className="text-strong">{t(L.NaturalWonders)}</div>
               <div className="mb5">
                  {jsxMapOf(Config.City[city].naturalWonders, (building, tech) => {
                     const def = Config.Building[building];
                     return (
                        <TextWithHelp
                           className="mr10"
                           key={building}
                           content={getBuildingDescription(building)}
                        >
                           {def.name()}
                        </TextWithHelp>
                     );
                  })}
               </div>
               {isEmpty(Config.City[city].uniqueMultipliers) ? null : (
                  <>
                     <div className="text-strong">{t(L.UniqueTechMultipliers)}</div>
                     <div className="mb5">
                        {jsxMapOf(Config.City[city].uniqueMultipliers, (tech, multipliers) => {
                           return (
                              <TextWithHelp
                                 className="mr10"
                                 key={tech}
                                 content={getMultipliersDescription(multipliers)}
                              >
                                 {Config.Tech[tech].name()}
                              </TextWithHelp>
                           );
                        })}
                     </div>
                  </>
               )}
               <div className="text-strong">{t(L.GreatPeople)}</div>
               <div className="mb5">
                  {jsxMapOf(Config.GreatPerson, (person, def) => {
                     if (def.city === city) {
                        return (
                           <TextWithHelp className="mr10" key={person} content={def.desc(def, 1)}>
                              {def.name()}
                           </TextWithHelp>
                        );
                     }
                     return null;
                  })}
               </div>
               <div className="text-strong">{t(L.Festival)}</div>
               <div className="mb5">{Config.City[city].festivalDesc()}</div>
               <div className="separator" />
               <div className="row">
                  <div className="f1">{t(L.GreatPersonLevelRequired)}</div>
                  {permanentGreatPeopleLevel >= Config.City[city].requireGreatPeopleLevel ? (
                     <div className="m-icon small mr5 text-green">check_circle</div>
                  ) : (
                     <div className="m-icon small mr5 text-red">cancel</div>
                  )}
                  <div className="text-strong">
                     <TextWithHelp
                        content={t(L.GreatPersonLevelRequiredDescV2, {
                           city: Config.City[city].name(),
                           required: Config.City[city].requireGreatPeopleLevel,
                           current: permanentGreatPeopleLevel,
                        })}
                     >
                        {Config.City[city].requireGreatPeopleLevel}
                     </TextWithHelp>
                  </div>
               </div>
               {Config.City[city].requireSupporterPack ? (
                  <>
                     <div className="separator" />
                     <div className="row">
                        <div className="f1 mr10">{t(L.SupporterPackRequired)}</div>
                        <div>
                           {hasFlag(user?.attr ?? UserAttributes.None, UserAttributes.DLC1) ? (
                              <div className="m-icon small text-green">check_circle</div>
                           ) : getFreeCityThisWeek() === city ? (
                              <div className="text-green text-strong">{t(L.FreeThisWeek)}</div>
                           ) : (
                              <div className="m-icon small text-red">cancel</div>
                           )}
                        </div>
                     </div>
                  </>
               ) : null}
            </fieldset>
            <div className="sep5"></div>
            <div className="text-right row" style={{ justifyContent: "flex-end" }}>
               <button
                  style={{ padding: "0 15px" }}
                  onClick={() => {
                     playClick();
                     hideModal();
                  }}
               >
                  {t(L.Cancel)}
               </button>
               <div style={{ width: "6px" }} />
               <button
                  disabled={
                     permanentGreatPeopleLevel < Config.City[city].requireGreatPeopleLevel ||
                     !hasSupporterPack()
                  }
                  style={{ padding: "0 15px" }}
                  className="text-strong"
                  onClick={async () => {
                     if (
                        getPermanentGreatPeopleLevel(getGameOptions()) <
                           Config.City[city].requireGreatPeopleLevel ||
                        !hasSupporterPack()
                     ) {
                        playError();
                        return;
                     }

                     try {
                        await Promise.race([client.rebirth(), rejectIn(10)]);
                     } catch (error) {
                        console.error(error);
                        if (!import.meta.env.DEV && isOnlineUser()) {
                           playError();
                           showToast(t(L.RebornOfflineWarning));
                           return;
                        }
                     }

                     const greatPeopleCount = clamp(
                        greatPeopleAtRebirthCount - gs.claimedGreatPeople,
                        0,
                        Number.POSITIVE_INFINITY,
                     );

                     if (!gs.rebirthed && canEarnGreatPeopleFromReborn()) {
                        rollPermanentGreatPeople(
                           greatPeopleCount,
                           pickPerRoll,
                           getGreatPeopleChoiceCount(gs),
                           getCurrentAge(gs),
                           gs.city,
                        ).forEach((gp) => {
                           getGameOptions().greatPeopleChoicesV2.push(gp);
                        });
                        makeGreatPeopleFromThisRunPermanent();
                        gs.rebirthed = true;
                     }

                     checkRebirthAchievements(greatPeopleCount, gs);

                     await resetToCity(city);
                     playClick();

                     try {
                        await saveGame();
                        window.location.reload();
                     } catch (error) {
                        playError();
                        showToast(String(error));
                     }
                  }}
               >
                  {t(L.Reborn)}
               </button>
            </div>
         </div>
      </div>
   );
}
