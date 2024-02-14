import { useEffect, useState } from "react";
import type { City } from "../../../shared/definitions/CityDefinitions";
import { Config } from "../../../shared/logic/Config";
import { getGreatPeopleAtReborn, rollPermanentGreatPeople } from "../../../shared/logic/RebornLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import {
   firstKeyOf,
   forEach,
   formatPercent,
   mapOf,
   reduceOf,
   rejectIn,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { resetToCity, saveGame, useGameOptions, useGameState } from "../Global";
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

   const gameState = useGameState();
   const options = useGameOptions();
   const [city, setCity] = useState<City>(firstKeyOf(Config.City)!);
   return (
      <div className="window" style={{ width: "450px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Reborn)}</div>
         </div>
         <div className="window-body">
            {tradeCount > 0 ? (
               <WarningComponent icon="warning" className="mb10">
                  <RenderHTML html={t(L.RebornTradeWarning)} />
               </WarningComponent>
            ) : null}
            {canEarnGreatPeopleFromReborn() ? (
               <fieldset>
                  <div className="row">
                     <div className="f1">{t(L.GreatPeopleThisRun)}</div>
                     <div className="text-strong">
                        {reduceOf(
                           gameState.greatPeople,
                           (prev, k, v) => {
                              return prev + v;
                           },
                           0,
                        )}
                     </div>
                  </div>
                  <div className="sep5"></div>
                  <div className="row">
                     <div className="f1">{t(L.TotalEmpireValue)}</div>
                     <div className="text-strong">
                        <FormatNumber value={Tick.current.totalValue} />
                     </div>
                  </div>
                  <div className="sep5"></div>
                  <div className="row">
                     <div className="f1">{t(L.ExtraGreatPeopleAtReborn)}</div>
                     <div className="text-strong">{getGreatPeopleAtReborn()}</div>
                  </div>
                  <div className="sep10" />
                  <div className="text-small text-desc">
                     <RenderHTML html={t(L.RebornModalDesc)} />
                  </div>
               </fieldset>
            ) : (
               <WarningComponent icon="warning" className="mb10">
                  {t(L.CannotEarnPermanentGreatPeopleDesc)}
               </WarningComponent>
            )}
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
               <div className="text-strong">{t(L.Deposit)}</div>
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
                           help={Config.Building[building].desc?.()}
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
                        <TextWithHelp className="mr10" key={building} size="large" help={def.desc?.()}>
                           {def.name()}
                        </TextWithHelp>
                     );
                  })}
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
                  style={{ padding: "0 15px" }}
                  className="text-strong"
                  onClick={async () => {
                     try {
                        await Promise.race([client.rebirth(), rejectIn(5)]);
                     } catch (error) {
                        console.error(error);
                        if (isOnlineUser()) {
                           playError();
                           showToast(t(L.RebornOfflineWarning));
                           return;
                        }
                     }
                     if (canEarnGreatPeopleFromReborn()) {
                        rollPermanentGreatPeople(getGreatPeopleAtReborn());
                        forEach(gameState.greatPeople, (k, v) => {
                           if (options.greatPeople[k]) {
                              options.greatPeople[k]!.amount += v;
                           } else {
                              options.greatPeople[k] = { level: 1, amount: v - 1 };
                           }
                        });
                     }
                     resetToCity(city);
                     saveGame(true).catch(console.error);
                     playClick();
                  }}
               >
                  {t(L.Reborn)}
               </button>
            </div>
         </div>
      </div>
   );
}
