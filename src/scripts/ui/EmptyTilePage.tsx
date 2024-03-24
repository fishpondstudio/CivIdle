import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useState } from "react";
import type { Building, IBuildingDefinition } from "../../../shared/definitions/BuildingDefinitions";
import {
   applyBuildingDefaults,
   checkBuildingMax,
   getBuildingCost,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getTypeBuildings, unlockedBuildings } from "../../../shared/logic/IntraTickCache";
import type { ITileData } from "../../../shared/logic/Tile";
import { makeBuilding } from "../../../shared/logic/Tile";
import {
   anyOf,
   formatNumber,
   hasFlag,
   isEmpty,
   keysOf,
   mapOf,
   numberToRoman,
   setContains,
   sizeOf,
   tileToPoint,
   toggleFlag,
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
import { TableView } from "./TableView";
import { TextWithHelp } from "./TextWithHelpComponent";

enum BuildingFilter {
   None = 0,
   Wonder = 1 << 0,
   Tier1 = 1 << 1,
   Tier2 = 1 << 2,
   Tier3 = 1 << 3,
   Tier4 = 1 << 4,
   Tier5 = 1 << 5,
   Tier6 = 1 << 6,
   Tier7 = 1 << 7,
   Tier8 = 1 << 8,
   Tier9 = 1 << 9,
   Tier10 = 1 << 10,
   Tier11 = 1 << 11,
   Tier12 = 1 << 12,

   NotBuilt = 1 << 28,
}

let lastBuild: Building | null = null;
let savedFilter = BuildingFilter.None;
const savedSorting = { column: 0, asc: true };

export function EmptyTilePage({ tile }: { tile: ITileData }): React.ReactNode {
   const gs = useGameState();
   const [, setSelected] = useState<Building | null>(null);
   const [buildingFilter, setBuildingFilter] = useState<BuildingFilter>(savedFilter);
   const [search, setSearch] = useState<string>("");
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
   const extractsDeposit = (b: IBuildingDefinition) => {
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
                  onChange={(e) => setSearch(e.target.value)}
               />
               <div className="row mt10">
                  <Filter
                     filter={buildingFilter}
                     current={BuildingFilter.Wonder}
                     onFilterChange={setBuildingFilter}
                  >
                     <div className="m-icon small">globe</div>
                  </Filter>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tier) => {
                     return (
                        <Filter
                           key={tier}
                           filter={buildingFilter}
                           current={1 << tier}
                           onFilterChange={setBuildingFilter}
                        >
                           {numberToRoman(tier)}
                        </Filter>
                     );
                  })}
                  <div className="f1"></div>

                  <Filter
                     tooltip={t(L.ShowUnbuiltOnly)}
                     filter={buildingFilter}
                     current={BuildingFilter.NotBuilt}
                     onFilterChange={setBuildingFilter}
                  >
                     <div className="m-icon small">lightbulb</div>
                  </Filter>
               </div>
            </fieldset>
            <TableView
               classNames="sticky-header building-list f1"
               sortingState={savedSorting}
               header={[
                  { name: t(L.BuildingTier), sortable: true },
                  { name: t(L.BuildingName), sortable: true },
                  { name: "", sortable: false },
                  { name: "", sortable: false },
               ]}
               data={keysOf(unlockedBuildings(gs)).filter((v) => {
                  if ((sizeOf(constructed.get(v)) ?? 0) >= (Config.Building[v].max ?? Infinity)) {
                     return false;
                  }

                  let filter = (buildingFilter & 0x0fffffff) === 0;

                  for (let i = 0; i < 12; i++) {
                     if (hasFlag(buildingFilter, 1 << i)) {
                        filter ||= Config.BuildingTier[v] === i;
                     }
                  }

                  if (hasFlag(buildingFilter, BuildingFilter.NotBuilt)) {
                     filter &&= (buildingByType.get(v)?.size ?? 0) === 0;
                  }

                  const s = search.toLowerCase();
                  return (
                     filter &&
                     (Config.Building[v].name().toLowerCase().includes(s) ||
                        anyOf(Config.Building[v].input, (res) =>
                           Config.Resource[res].name().toLowerCase().includes(s),
                        ) ||
                        anyOf(Config.Building[v].output, (res) =>
                           Config.Resource[res].name().toLowerCase().includes(s),
                        ))
                  );
               })}
               compareFunc={(a, b, col) => {
                  switch (col) {
                     case 1:
                        return Config.Building[a]!.name().localeCompare(Config.Building[b]!.name());
                     default: {
                        const diff = (Config.BuildingTier[a] ?? 0) - (Config.BuildingTier[b] ?? 0);
                        if (diff !== 0) return diff;
                        return Config.Building[a]!.name().localeCompare(Config.Building[b]!.name());
                     }
                  }
               }}
               renderRow={(k) => {
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
                              {extractsDeposit(building) ? (
                                 <div className="m-icon small text-orange ml5">stars</div>
                              ) : null}
                              {k === lastBuild ? (
                                 <div className="m-icon small text-orange ml5">replay</div>
                              ) : null}
                           </div>
                           <div>
                              <div className="row text-small text-desc">
                                 {isEmpty(building.input) ? null : (
                                    <div className="m-icon small mr2 fs">exit_to_app</div>
                                 )}
                                 <div>
                                    {jsxMapOf(building.input, (res, amount) => (
                                       <span key={res} className="mr5">
                                          {Config.Resource[res].name()} x{formatNumber(amount)}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                              <div className="row text-small text-desc">
                                 {isEmpty(building.output) ? null : (
                                    <div className="m-icon small mr2 fs">output</div>
                                 )}
                                 <div>
                                    {jsxMapOf(building.output, (res, amount) => (
                                       <span key={res} className="mr5">
                                          {Config.Resource[res].name()} x{formatNumber(amount)}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                              {building.power ? (
                                 <div className="row text-small text-desc">
                                    <div className="m-icon small mr2">bolt</div>
                                    <div>{t(L.RequirePower)}</div>
                                 </div>
                              ) : null}
                           </div>
                        </td>
                        <td className="right text-small">
                           {building.construction ? (
                              <Tippy
                                 content={t(L.ConstructionCost, {
                                    cost: mapOf(
                                       buildCost,
                                       (res, amount) =>
                                          `${Config.Resource[res].name()} x${formatNumber(amount)}`,
                                    ).join(", "),
                                 })}
                              >
                                 <div className="m-icon small text-desc">construction</div>
                              </Tippy>
                           ) : null}
                        </td>
                        <td>
                           <div className="text-link text-strong" onClick={() => build(k)}>
                              {t(L.Build)}
                           </div>
                        </td>
                     </tr>
                  );
               }}
            />
         </div>
      </div>
   );
}

function Filter({
   tooltip,
   children,
   filter,
   current,
   onFilterChange,
}: React.PropsWithChildren<{
   tooltip?: string;
   filter: BuildingFilter;
   current: BuildingFilter;
   onFilterChange: (f: BuildingFilter) => void;
}>): React.ReactNode {
   const content = (
      <button
         className={classNames({
            active: hasFlag(filter, current),
         })}
         style={{ width: 27, padding: 0 }}
         onClick={() => {
            savedFilter = toggleFlag(filter, current);
            onFilterChange(savedFilter);
         }}
      >
         {children}
      </button>
   );
   if (!tooltip) {
      return content;
   }
   return <Tippy content={tooltip}>{content}</Tippy>;
}
