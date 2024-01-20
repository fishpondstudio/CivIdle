import { useState } from "react";
import { firstKeyOf, forEach, formatPercent, jsxMapOf, mapOf, reduceOf } from "../../../shared/Helper";
import { resetToCity, saveGame, useGameOptions, useGameState } from "../Global";
import type { City } from "../definitions/CityDefinitions";
import { Config } from "../logic/Config";
import { getGreatPeopleAtReborn, rollPermanentGreatPeople } from "../logic/RebornLogic";
import { Tick } from "../logic/TickLogic";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { WarningComponent } from "./WarningComponent";

export function RebornModal(): React.ReactNode {
   const gameState = useGameState();
   const options = useGameOptions();
   const [city, setCity] = useState<City>(firstKeyOf(Config.City)!);
   return (
      <div className="window" style={{ width: "400px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Reborn)}</div>
         </div>
         <div className="window-body">
            <WarningComponent icon="info">
               Your will start a new empire but you can take all the great people from this run, plus extra
               great people based on your total empire value.
            </WarningComponent>
            <div className="sep10"></div>
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
            </fieldset>
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
                        <span
                           key={building}
                           style={{
                              textDecoration: "dotted underline",
                              textUnderlineOffset: "0.25em",
                              cursor: "help",
                           }}
                           className="mr10"
                           aria-label={Config.Building[building].desc?.()}
                           data-balloon-pos="up"
                           data-balloon-text="left"
                           data-balloon-length="large"
                        >
                           {Config.Building[building].name()}{" "}
                           <span className="text-desc">({Config.Tech[tech].name()})</span>
                        </span>
                     );
                  })}
               </div>
               <div className="sep5"></div>
               <div className="text-strong">{t(L.NaturalWonders)}</div>
               <div>
                  {jsxMapOf(Config.City[city].naturalWonders, (building, tech) => {
                     const def = Config.Building[building];
                     return (
                        <span
                           key={building}
                           style={{
                              textDecoration: "dotted underline",
                              textUnderlineOffset: "0.25em",
                              cursor: "help",
                           }}
                           className="mr10"
                           aria-label={def.desc?.()}
                           data-balloon-pos="up"
                           data-balloon-text="left"
                           data-balloon-length="large"
                        >
                           {def.name()}
                        </span>
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
                  onClick={() => {
                     rollPermanentGreatPeople(getGreatPeopleAtReborn());
                     forEach(gameState.greatPeople, (k, v) => {
                        if (options.greatPeople[k]) {
                           options.greatPeople[k]!.amount += v;
                        } else {
                           options.greatPeople[k] = { level: 1, amount: v - 1 };
                        }
                     });
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
