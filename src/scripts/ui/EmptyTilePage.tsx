import { useState } from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import {
   checkBuildingMax,
   getBuildingCost,
   isWorldOrNaturalWonder,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getTypeBuildings, unlockedBuildings } from "../../../shared/logic/IntraTickCache";
import type { ITileData } from "../../../shared/logic/Tile";
import { makeBuilding } from "../../../shared/logic/Tile";
import {
   anyOf,
   formatNumber,
   isEmpty,
   keysOf,
   mapOf,
   numberToRoman,
   setContains,
   sizeOf,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import "../../css/EmptyTilePage.css";
import { useGameState } from "../Global";
import { jsxMapOf } from "../utilities/Helper";
import { useShortcut } from "../utilities/Hook";
import { playError } from "../visuals/Sound";
import { MenuComponent } from "./MenuComponent";

let lastBuild: Building | null = null;

export function EmptyTilePage({ tile }: { tile: ITileData }): React.ReactNode {
   const gs = useGameState();
   const [, setSelected] = useState<Building | null>(null);
   const [filter, setFilter] = useState<string>("");
   const constructed = getTypeBuildings(gs);
   const build = (k: Building) => {
      if (!checkBuildingMax(k, gs)) {
         playError();
         return;
      }
      tile.building = makeBuilding({ type: k });
      tile.building.priority = getGameOptions().defaultPriority;
      notifyGameStateUpdate();
      lastBuild = k;
   };
   useShortcut(
      "EmptyTilePageBuildLastBuilding",
      () => {
         if (lastBuild && checkBuildingMax(lastBuild, gs)) {
            build(lastBuild);
         }
      },
      [],
   );
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
                           <div className="f1">{Config.Resource[k].name()}</div>
                           <div className="m-icon small text-link">visibility</div>
                        </div>
                     );
                  },
                  () => {
                     return <div className="text-desc">{t(L.NoDepositDesc)}</div>;
                  },
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
                           return Config.Building[a].name().localeCompare(Config.Building[b].name());
                        })
                        .filter((v) => {
                           const f = filter.toLowerCase();
                           return (
                              Config.Building[v].name().toLowerCase().includes(f) ||
                              anyOf(Config.Building[v].input, (res) =>
                                 Config.Resource[res].name().toLowerCase().includes(f),
                              ) ||
                              anyOf(Config.Building[v].output, (res) =>
                                 Config.Resource[res].name().toLowerCase().includes(f),
                              )
                           );
                        })
                        .map((k) => {
                           if ((sizeOf(constructed.get(k)) ?? 0) >= (Config.Building[k].max ?? Infinity)) {
                              return null;
                           }
                           const building = Config.Building[k];
                           const buildCost = getBuildingCost({
                              type: k,
                              level: 0,
                           });
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
                                                {sizeOf(buildingByType.get(k))}
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
                                             `${Config.Resource[res].name()} x${formatNumber(amount)}`,
                                       ).join(", ")}
                                    </div>
                                    <div className="row text-small text-desc">
                                       {isEmpty(building.output) ? null : (
                                          <div className="m-icon small mr2">output</div>
                                       )}
                                       {mapOf(
                                          building.output,
                                          (res, amount) =>
                                             `${Config.Resource[res].name()} x${formatNumber(amount)}`,
                                       ).join(", ")}
                                    </div>
                                 </td>
                                 <td className="right text-small">
                                    {jsxMapOf(buildCost, (res, amount) => {
                                       return (
                                          <div className="nowrap" key={res}>
                                             {Config.Resource[res].name()} x
                                             {formatNumber(amount)}
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
