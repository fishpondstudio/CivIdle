import { useEffect, useState } from "react";
import type { City } from "../../../shared/definitions/CityDefinitions";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import {
   getGreatPeopleChoiceCount,
   getPermanentGreatPeopleLevel,
   getRebirthGreatPeopleCount,
   makeGreatPeopleFromThisRunPermanent,
   rollPermanentGreatPeople,
} from "../../../shared/logic/RebornLogic";
import { getCurrentAge } from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { clamp, formatPercent, mapOf, reduceOf, rejectIn } from "../../../shared/utilities/Helper";
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

export function RebornModal(): React.ReactNode {
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
   const permanentGreatPeopleLevel = getPermanentGreatPeopleLevel();
   const greatPeopleAtRebirthCount = getRebirthGreatPeopleCount();
   return (
      <div className="window" style={{ width: "500px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Reborn)}</div>
         </div>
         <div className="window-body">
            {tradeCount > 0 ? (
               <WarningComponent icon="warning" className="mb10 text-small">
                  <RenderHTML html={t(L.RebornTradeWarning)} />
               </WarningComponent>
            ) : null}
            <WarningComponent icon="info" className="mb10 text-small">
               <RenderHTML html={t(L.RebornModalDescV2)} />
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
                  <div className="f1">{t(L.RebornCity)}</div>
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
               <div>
                  {mapOf(Config.City[city].deposits, (dep, value) => {
                     return `${Config.Resource[dep].name()}: ${formatPercent(value)}`;
                  }).join(", ")}
               </div>
               <div className="sep5"></div>
               <div className="text-strong">{t(L.UniqueBuildings)}</div>
               <div>
                  {jsxMapOf(Config.City[city].uniqueBuildings, (building, tech) => {
                     return (
                        <TextWithHelp
                           className="mr10"
                           key={building}
                           size="large"
                           content={Config.Building[building].desc?.()}
                        >
                           {Config.Building[building].name()}{" "}
                           <span className="text-desc">({Config.Tech[tech].name()})</span>
                        </TextWithHelp>
                     );
                  })}
               </div>
               <div className="sep5"></div>
               <div className="text-strong">{t(L.NaturalWonders)}</div>
               <div>
                  {jsxMapOf(Config.City[city].naturalWonders, (building, tech) => {
                     const def = Config.Building[building];
                     return (
                        <TextWithHelp className="mr10" key={building} size="large" content={def.desc?.()}>
                           {def.name()}
                        </TextWithHelp>
                     );
                  })}
               </div>
               <div className="separator" />
               <div className="row">
                  <div className=" f1">{t(L.GreatPersonLevelRequired)}</div>
                  {permanentGreatPeopleLevel >= Config.City[city].requiredGreatPeopleLevel ? (
                     <div className="m-icon small mr5 text-green">check_circle</div>
                  ) : (
                     <div className="m-icon small mr5 text-red">cancel</div>
                  )}
                  <div className="text-strong">
                     <TextWithHelp
                        content={t(L.GreatPersonLevelRequiredDesc, {
                           city: Config.City[city].name(),
                           required: Config.City[city].requiredGreatPeopleLevel,
                           current: permanentGreatPeopleLevel,
                        })}
                     >
                        {Config.City[city].requiredGreatPeopleLevel}
                     </TextWithHelp>
                  </div>
               </div>
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
                  disabled={permanentGreatPeopleLevel < Config.City[city].requiredGreatPeopleLevel}
                  style={{ padding: "0 15px" }}
                  className="text-strong"
                  onClick={async () => {
                     if (getPermanentGreatPeopleLevel() < Config.City[city].requiredGreatPeopleLevel) {
                        playError();
                        return;
                     }

                     try {
                        await Promise.race([client.rebirth(), rejectIn(10)]);
                     } catch (error) {
                        console.error(error);
                        if (isOnlineUser()) {
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
                           getGreatPeopleChoiceCount(gs),
                           getCurrentAge(gs),
                           gs.city,
                        ).forEach((gp) => {
                           getGameOptions().greatPeopleChoices.push(gp);
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
