import { useState } from "react";
import "../../css/EmptyTilePage.css";
import { Building } from "../definitions/BuildingDefinitions";
import { notifyGameStateUpdate, useGameState } from "../Global";
import { getBuildingCost, isWorldOrNaturalWonder } from "../logic/BuildingLogic";
import { Config } from "../logic/Constants";
import { getTypeBuildings, unlockedBuildings } from "../logic/IntraTickCache";
import { useShortcut } from "../logic/Shortcut";
import { Tick } from "../logic/TickLogic";
import { ITileData, makeBuilding } from "../logic/Tile";
import {
   formatNumber,
   isEmpty,
   jsxMapOf,
   keysOf,
   mapOf,
   numberToRoman,
   setContains,
   sizeOf,
} from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { MenuComponent } from "./MenuComponent";

let lastBuild: Building | null = null;

export function EmptyTilePage({ tile }: { tile: ITileData }): JSX.Element {
   const gs = useGameState();
   const [, setSelected] = useState<Building | null>(null);
   const [filter, setFilter] = useState<string>("");
   const constructed = getTypeBuildings(gs);
   const build = (k: Building) => {
      lastBuild = k;
      tile.building = makeBuilding({ type: k });
      notifyGameStateUpdate();
   };
   useShortcut("EmptyTilePageBuildLastBuilding", () => {
      if (lastBuild) {
         build(lastBuild);
      }
   });
   const buildingByType = getTypeBuildings(gs);
   return (
      <div className="window" onPointerDown={() => setSelected(null)}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Tile)}</div>
         </div>
         <MenuComponent />
         <div className="window-body" style={{ display: "flex", flexDirection: "column" }}>
            <fieldset>
               <legend>{t(L.Deposit)}</legend>
               {jsxMapOf(
                  tile.deposit,
                  (k, v) => {
                     return (
                        <div key={k} className="row mv5">
                           <div className="f1">{Tick.current.resources[k].name()}</div>
                           <div className="m-icon small text-link">visibility</div>
                        </div>
                     );
                  },
                  () => {
                     return <div className="text-desc">{t(L.NoDepositDesc)}</div>;
                  }
               )}
            </fieldset>
            <fieldset>
               <legend>{t(L.BuildingANew)}</legend>
               <input
                  type="text"
                  style={{ width: "100%" }}
                  placeholder={t(L.BuildingSearchText)}
                  onChange={(e) => setFilter(e.target.value)}
               />
            </fieldset>
            <div className="table-view sticky-header building-list f1">
               <table>
                  <thead>
                     <tr>
                        <th className="text-center">{t(L.BuildingTier)}</th>
                        <th>{t(L.BuildingName)}</th>
                        <th className="right">{t(L.BuildingCost)}</th>
                        <th />
                     </tr>
                  </thead>
                  <tbody>
                     {keysOf(unlockedBuildings(gs))
                        .sort((a, b) => {
                           if (isWorldOrNaturalWonder(a) && !isWorldOrNaturalWonder(b)) {
                              return -1;
                           }
                           if (isWorldOrNaturalWonder(b) && !isWorldOrNaturalWonder(a)) {
                              return 1;
                           }
                           const tier = (Config.BuildingTier[a] ?? 0) - (Config.BuildingTier[b] ?? 0);
                           if (tier !== 0) {
                              return tier;
                           }
                           return Tick.current.buildings[a].name().localeCompare(Tick.current.buildings[b].name());
                        })
                        .filter((v) => Tick.current.buildings[v].name().toLowerCase().includes(filter.toLowerCase()))
                        .map((k) => {
                           if ((sizeOf(constructed[k]) ?? 0) >= (Tick.current.buildings[k].max ?? Infinity)) {
                              return null;
                           }
                           const building = Tick.current.buildings[k];
                           const buildCost = getBuildingCost({ type: k, level: 1 });
                           return (
                              <tr
                                 key={k}
                                 onPointerDown={(e) => {
                                    setSelected(k);
                                    e.stopPropagation();
                                 }}
                              >
                                 <td className="text-center text-strong">
                                    {(building?.max ?? Infinity) <= 1 ? (
                                       <div
                                          className="m-icon small"
                                          aria-label={building.desc?.()}
                                          data-balloon-pos="right"
                                          data-balloon-text="left"
                                          data-balloon-length="large"
                                       >
                                          public
                                       </div>
                                    ) : (
                                       numberToRoman(Config.BuildingTier[k] ?? 1)
                                    )}
                                 </td>
                                 <td>
                                    <div className="row">
                                       <div>
                                          <span className="text-strong">{building.name()}</span>
                                          {building.max === 1 ? null : (
                                             <span className="text-desc text-small ml5">
                                                {sizeOf(buildingByType[k])}
                                             </span>
                                          )}
                                       </div>
                                       {building.deposit && setContains(tile.deposit, building.deposit) ? (
                                          <div className="m-icon small text-orange ml5">stars</div>
                                       ) : null}
                                       {k === lastBuild ? (
                                          <div className="m-icon small text-orange ml5">replay</div>
                                       ) : null}
                                    </div>
                                    <div className="row text-small text-desc">
                                       {isEmpty(building.input) ? null : (
                                          <div className="m-icon small mr2">exit_to_app</div>
                                       )}
                                       {mapOf(
                                          building.input,
                                          (res, amount) =>
                                             `${Tick.current.resources[res].name()} x${formatNumber(amount)}`
                                       ).join(", ")}
                                    </div>
                                    <div className="row text-small text-desc">
                                       {isEmpty(building.output) ? null : (
                                          <div className="m-icon small mr2">output</div>
                                       )}
                                       {mapOf(
                                          building.output,
                                          (res, amount) =>
                                             `${Tick.current.resources[res].name()} x${formatNumber(amount)}`
                                       ).join(", ")}
                                    </div>
                                 </td>
                                 <td className="right text-small">
                                    {jsxMapOf(buildCost, (res, amount) => {
                                       return (
                                          <div className="nowrap" key={res}>
                                             {Tick.current.resources[res].name()} x{formatNumber(amount)}
                                          </div>
                                       );
                                    })}
                                 </td>
                                 <td>
                                    <div className="row text-link" onClick={() => build(k)}>
                                       <div className="f1" />
                                       <div className="m-icon small">construction</div>
                                       <div className="text-link">{t(L.Build)}</div>
                                    </div>
                                 </td>
                              </tr>
                           );
                        })}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
