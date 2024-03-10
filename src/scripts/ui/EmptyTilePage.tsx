import { useState } from "react";
import type { Building, IBuildingDefinition } from "../../../shared/definitions/BuildingDefinitions";
import {
   applyBuildingDefaults,
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
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import "../../css/EmptyTilePage.css";
import { useGameState } from "../Global";
import { WorldScene } from "../scenes/WorldScene";
import { jsxMapOf } from "../utilities/Helper";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playError } from "../visuals/Sound";
import { MenuComponent } from "./MenuComponent";
import { TextWithHelp } from "./TextWithHelpComponent";

let lastBuild: Building | null = null;

export function EmptyTilePage({ tile }: { tile: ITileData }): React.ReactNode {
   const gs = useGameState();
   const [, setSelected] = useState<Building | null>(null);
   const [notBuilt, setNotBuilt] = useState<boolean>(false);
   const [filter, setFilter] = useState<string>("");
   const constructed = getTypeBuildings(gs);
   const build = (k: Building) => {
      if (!checkBuildingMax(k, gs)) {
         playError();
         return;
      }
      tile.building = applyBuildingDefaults(makeBuilding({ type: k }), getGameOptions());
      notifyGameStateUpdate();
      lastBuild = k;
   };
   const usesDeposit = (b: IBuildingDefinition) => {
      return b.deposit && setContains(tile.deposit, b.deposit);
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
                        <div
                           key={k}
                           className="text-strong row mv5"
                           onClick={() => {
                              const result: Tile[] = [];
                              gs.tiles.forEach((tile, xy) => {
                                 if (tile.explored && tile.deposit[k]) {
                                    result.push(xy);
                                 }
                              });
                              Singleton()
                                 .sceneManager.getCurrent(WorldScene)
                                 ?.drawSelection(tileToPoint(tile.tile), result);
                           }}
                        >
                           <div className="f1">{Config.Resource[k].name()}</div>
                           <div className="m-icon small text-link">search</div>
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
               <div className="sep5"></div>
               <div className="separator"></div>
               <div className="row">
                  <div className="f1">{t(L.ShowNotBuilt)}</div>
                  <div
                     className="pointer"
                     onClick={() => {
                        setNotBuilt(!notBuilt);
                     }}
                  >
                     {notBuilt === true ? (
                        <div className="m-icon text-green">toggle_on</div>
                     ) : (
                        <div className="m-icon text-desc">toggle_off</div>
                     )}
                  </div>
               </div>
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
                           if (usesDeposit(Config.Building[a]) && !usesDeposit(Config.Building[b])) {
                              return -1;
                           }
                           if (usesDeposit(Config.Building[b]) && !usesDeposit(Config.Building[a])) {
                              return 1;
                           }
                           if (lastBuild === a && lastBuild !== b) {
                              return -1;
                           }
                           if (lastBuild === b && lastBuild !== a) {
                              return 1;
                           }
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
                           let filterNotBuilt = false;
                           if (notBuilt === true) {
                              if (sizeOf(buildingByType.get(v)) === 0) {
                                 filterNotBuilt = true;
                              }
                           } else {
                              filterNotBuilt = true;
                           }
                           const f = filter.toLowerCase();
                           return (
                              filterNotBuilt &&
                              (Config.Building[v].name().toLowerCase().includes(f) ||
                                 anyOf(Config.Building[v].input, (res) =>
                                    Config.Resource[res].name().toLowerCase().includes(f),
                                 ) ||
                                 anyOf(Config.Building[v].output, (res) =>
                                    Config.Resource[res].name().toLowerCase().includes(f),
                                 ))
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
                                       <div className="m-icon small">
                                          <TextWithHelp content={building.desc?.()} noStyle>
                                             public
                                          </TextWithHelp>
                                       </div>
                                    ) : (
                                       <div
                                          className="pointer"
                                          onClick={() => {
                                             const result: Tile[] = [];
                                             gs.tiles.forEach((tile, xy) => {
                                                if (tile.building?.type === k) {
                                                   result.push(xy);
                                                }
                                             });
                                             Singleton()
                                                .sceneManager.getCurrent(WorldScene)
                                                ?.drawSelection(tileToPoint(tile.tile), result);
                                          }}
                                       >
                                          {numberToRoman(Config.BuildingTier[k] ?? 1)}
                                       </div>
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
                                       {usesDeposit(building) ? (
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
                                             {Config.Resource[res].name()} x{formatNumber(amount)}
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
