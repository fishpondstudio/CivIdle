import Tippy from "@tippyjs/react";
import { memo, useCallback, useState } from "react";
import type { Building, IBuildingDefinition } from "../../../shared/definitions/BuildingDefinitions";
import {
   applyBuildingDefaults,
   checkBuildingMax,
   getBuildingCost,
   isSpecialBuilding,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getGrid, getTypeBuildings, unlockedBuildings } from "../../../shared/logic/IntraTickCache";
import { getBuildingUnlockTech } from "../../../shared/logic/TechLogic";
import type { ITileData } from "../../../shared/logic/Tile";
import { makeBuilding } from "../../../shared/logic/Tile";
import {
   anyOf,
   cls,
   formatNumber,
   hasFlag,
   isEmpty,
   keysOf,
   numberToRoman,
   pointToTile,
   range,
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
import { playClick, playError } from "../visuals/Sound";
import { BuildingFilter, Filter } from "./FilterComponent";
import { MenuComponent } from "./MenuComponent";
import { ResourceAmountComponent } from "./ResourceAmountComponent";
import { TableView } from "./TableView";
import { TextWithHelp } from "./TextWithHelpComponent";
import { BuildingSpriteComponent } from "./TextureSprites";
import { TitleBarComponent } from "./TitleBarComponent";

let lastBuild: Building | null = null;
let savedFilter = BuildingFilter.None;
const savedSorting = { column: 0, asc: true };

export function EmptyTilePage({ tile }: { tile: ITileData }): React.ReactNode {
   const gs = useGameState();
   const options = getGameOptions();
   const [, setSelected] = useState<Building | null>(null);
   const [buildingFilter, _setBuildingFilter] = useState<BuildingFilter>(savedFilter);
   const setBuildingFilter = (newFilter: BuildingFilter) => {
      _setBuildingFilter(newFilter);
      savedFilter = newFilter;
   };
   const [buildCount, setBuildCount] = useState<number>(1);
   const [search, setSearch] = useState<string>("");
   const constructed = getTypeBuildings(gs);
   const [buildRange, setBuildRange] = useState<number>(0);
   const build = useCallback(
      (k: Building) => {
         if (!checkBuildingMax(k, gs)) {
            playError();
            return;
         }

         tile.building = applyBuildingDefaults(makeBuilding({ type: k }), getGameOptions());
         if (!isSpecialBuilding(k) && buildRange > 0) {
            getGrid(gs)
               .getRange(tileToPoint(tile.tile), buildRange)
               .forEach((p) => {
                  const xy = pointToTile(p);
                  const tileData = gs.tiles.get(xy);
                  if (tileData?.explored && !tileData.building) {
                     tileData.building = applyBuildingDefaults(makeBuilding({ type: k }), getGameOptions());
                  }
               });
         }
         if (!isSpecialBuilding(k)) {
            lastBuild = k;
         }
         notifyGameStateUpdate();
         playClick();
      },
      [gs, buildRange, tile],
   );

   const onMouseOver = useCallback(
      (building: Building) => {
         if (buildRange <= 0) {
            return;
         }
         if (isSpecialBuilding(building)) {
            return;
         }
         const result: Tile[] = [];
         getGrid(gs)
            .getRange(tileToPoint(tile.tile), buildRange)
            .forEach((p) => {
               const xy = pointToTile(p);
               const tileData = gs.tiles.get(xy);
               if (tileData?.explored && !tileData.building) {
                  result.push(xy);
               }
            });
         setBuildCount(result.length);
         Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(tileToPoint(tile.tile), result);
      },
      [gs, buildRange, tile],
   );

   const onMouseLeave = useCallback(
      (building: Building) => {
         if (buildRange <= 0) {
            return;
         }
         if (isSpecialBuilding(building)) {
            return;
         }
         setBuildCount(1);
         Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(tileToPoint(tile.tile), []);
      },
      [buildRange, tile],
   );

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
   const filteredBuildings = keysOf(unlockedBuildings(gs)).filter((v) => {
      if ((sizeOf(constructed.get(v)) ?? 0) >= (Config.Building[v].max ?? Number.POSITIVE_INFINITY)) {
         return false;
      }

      if (v === "BritishMuseum" && gs.unlockedUpgrades.BritishMuseum) {
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
            anyOf(Config.Building[v].input, (res) => Config.Material[res].name().toLowerCase().includes(s)) ||
            anyOf(Config.Building[v].output, (res) => Config.Material[res].name().toLowerCase().includes(s)))
      );
   });

   let view: React.ReactNode;
   if (options.constructionGridView) {
      view = (
         <div className="inset-shallow white" style={{ overflowY: "auto", padding: 5 }}>
            <div
               style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(auto, calc(100% / 4)))",
               }}
            >
               {filteredBuildings
                  .sort((a, b) => {
                     return Config.Building[a].name().localeCompare(Config.Building[b].name());
                  })
                  .map((b) => {
                     return (
                        <BuildingGridItem
                           key={b}
                           building={b}
                           buildCount={buildCount}
                           onClick={build}
                           onMouseOver={onMouseOver}
                           onMouseLeave={onMouseLeave}
                        />
                     );
                  })}
            </div>
         </div>
      );
   } else {
      view = (
         <TableView
            classNames="sticky-header building-list f1"
            sortingState={savedSorting}
            header={[
               { name: t(L.BuildingTier), sortable: true },
               { name: "", sortable: false },
               { name: t(L.BuildingName), sortable: true },
               { name: "", sortable: false },
            ]}
            data={filteredBuildings}
            compareFunc={(a, b, col) => {
               switch (col) {
                  case 2:
                     if (extractsDeposit(Config.Building[a]) && !extractsDeposit(Config.Building[b])) {
                        return -1;
                     }
                     if (!extractsDeposit(Config.Building[a]) && extractsDeposit(Config.Building[b])) {
                        return 1;
                     }
                     return Config.Building[a]!.name().localeCompare(Config.Building[b]!.name());
                  default: {
                     if (extractsDeposit(Config.Building[a]) && !extractsDeposit(Config.Building[b])) {
                        return -1;
                     }
                     if (!extractsDeposit(Config.Building[a]) && extractsDeposit(Config.Building[b])) {
                        return 1;
                     }
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
                     <td className="text-center text-strong" style={{ width: 0 }}>
                        {(building?.max ?? Number.POSITIVE_INFINITY) <= 1 ? (
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
                     <td width={1}>
                        <BuildingSpriteComponent
                           building={k}
                           scale={0.5}
                           style={{ filter: "invert(0.75)" }}
                        />
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
                              <Tippy content={t(L.BuildingExtractDeposit)}>
                                 <div className="m-icon small text-orange ml5">stars</div>
                              </Tippy>
                           ) : null}
                           {k === lastBuild ? (
                              <div className="m-icon small text-orange ml5">replay</div>
                           ) : null}
                        </div>
                        <div>
                           <div className="row text-small text-desc">
                              {isEmpty(buildCost) ? null : <div className="m-icon small mr2 fs">build</div>}
                              <div>
                                 {jsxMapOf(buildCost, (res, amount) => (
                                    <ResourceAmountComponent
                                       key={res}
                                       className="mr5"
                                       resource={res}
                                       amount={amount}
                                       showLabel={true}
                                       showTooltip={true}
                                    />
                                 ))}
                              </div>
                           </div>
                        </div>
                        <div>
                           <div className="row text-small text-desc">
                              {isEmpty(building.input) ? null : (
                                 <div className="m-icon small mr2 fs">exit_to_app</div>
                              )}
                              <div>
                                 {jsxMapOf(building.input, (res, amount) => (
                                    <span key={res} className="mr5">
                                       {Config.Material[res].name()} x{formatNumber(amount)}
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
                                       {Config.Material[res].name()} x{formatNumber(amount)}
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
                     <td style={{ width: 0 }}>
                        <Tippy content={t(L.XBuildingsWillBeBuilt, { count: buildCount })}>
                           <div
                              className="text-link text-strong"
                              onClick={() => build(k)}
                              onMouseOver={() => onMouseOver(k)}
                              onMouseLeave={() => onMouseLeave(k)}
                           >
                              {t(L.Build)}
                           </div>
                        </Tippy>
                     </td>
                  </tr>
               );
            }}
         />
      );
   }

   return (
      <div className="window" onPointerDown={() => setSelected(null)}>
         <TitleBarComponent>{t(L.Tile)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body" style={{ display: "flex", flexDirection: "column" }}>
            {sizeOf(tile.deposit) > 0 ? (
               <div className="row inset-shallow-2 mb5" style={{ padding: "0 5px" }}>
                  <div className="f1 text-strong">{t(L.Deposit)}</div>
                  {jsxMapOf(tile.deposit, (k, v) => {
                     return (
                        <button
                           key={k}
                           className="mv5"
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
                           {Config.Material[k].name()}
                        </button>
                     );
                  })}
               </div>
            ) : null}
            <div className="row mb5">
               <input
                  type="text"
                  className="f1"
                  placeholder={t(L.BuildingSearchText)}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <div className="row mb5">
               <Filter
                  filter={buildingFilter}
                  current={BuildingFilter.Wonder}
                  savedFilter={savedFilter}
                  onFilterChange={setBuildingFilter}
               >
                  <div className="m-icon small">globe</div>
               </Filter>
               {[1, 2, 3, 4, 5, 6, 7, 8].map((tier) => {
                  return (
                     <Filter
                        key={tier}
                        filter={buildingFilter}
                        current={1 << tier}
                        savedFilter={savedFilter}
                        onFilterChange={setBuildingFilter}
                     >
                        {numberToRoman(tier)}
                     </Filter>
                  );
               })}
               <div className="f1"></div>
               <Tippy
                  content={
                     buildRange === 0
                        ? t(L.BuildWithin0TileRange)
                        : t(L.BuildWithinXTileRange, { range: buildRange })
                  }
               >
                  <select
                     value={buildRange}
                     onChange={(e) => {
                        playClick();
                        setBuildRange(Number.parseInt(e.target.value));
                        notifyGameStateUpdate();
                     }}
                  >
                     <option value={0}></option>
                     {range(1, 10).map((v) => (
                        <option key={v} value={v}>
                           {v}
                        </option>
                     ))}
                  </select>
               </Tippy>
               <div style={{ width: 5 }}></div>
               <button
                  className={cls(options.constructionGridView ? "active" : null)}
                  style={{ width: 27, padding: 0 }}
                  onClick={() => {
                     playClick();
                     options.constructionGridView = !options.constructionGridView;
                     notifyGameStateUpdate();
                  }}
               >
                  <div className="m-icon small">grid_view</div>
               </button>
               <Filter
                  tooltip={t(L.ShowUnbuiltOnly)}
                  filter={buildingFilter}
                  current={BuildingFilter.NotBuilt}
                  savedFilter={savedFilter}
                  onFilterChange={setBuildingFilter}
               >
                  <div className="m-icon small">lightbulb</div>
               </Filter>
            </div>
            {view}
         </div>
      </div>
   );
}

function BuildingInfoComponent({ building }: { building: Building }): React.ReactNode {
   const buildCost = getBuildingCost({
      type: building,
      level: 0,
   });
   const def = Config.Building[building];
   const tier = Config.BuildingTier[building] ?? 0;
   const age = Config.BuildingTechAge[building];
   const tech = getBuildingUnlockTech(building);
   return (
      <>
         <div className="row mt5">
            <div className="m-icon small mr2">build</div>
            <div className="text-strong">{t(L.Construction)}</div>
         </div>
         {jsxMapOf(buildCost, (res, amount) => (
            <ResourceAmountComponent
               key={res}
               resource={res}
               amount={amount}
               showLabel={true}
               showTooltip={false}
               className="mr5"
            />
         ))}
         {sizeOf(def.input) > 0 ? (
            <>
               <div className="row mt5">
                  <div className="m-icon small mr2">exit_to_app</div>
                  <div className="text-strong">{t(L.Consume)}</div>
               </div>
               {jsxMapOf(def.input, (res, amount) => (
                  <ResourceAmountComponent
                     key={res}
                     resource={res}
                     amount={amount}
                     showLabel={true}
                     showTooltip={false}
                     className="mr5"
                  />
               ))}
            </>
         ) : null}
         {sizeOf(def.output) > 0 ? (
            <>
               <div className="row mt5">
                  <div className="m-icon small mr2">output</div>
                  <div className="text-strong">{t(L.Produce)}</div>
               </div>
               {jsxMapOf(def.output, (res, amount) => (
                  <ResourceAmountComponent
                     key={res}
                     resource={res}
                     amount={amount}
                     showLabel={true}
                     showTooltip={false}
                     className="mr5"
                  />
               ))}
            </>
         ) : null}
         <div className="text-strong row mt5">
            <div className="m-icon small mr2">sell</div>
            {tier > 0 ? (
               <div>
                  {t(L.BuildingTier)} {numberToRoman(tier)}
               </div>
            ) : null}
            {age ? <div className="ml10">{Config.TechAge[age].name()}</div> : null}
            {tech ? <div className="ml10">{Config.Tech[tech].name()}</div> : null}
         </div>
      </>
   );
}

function _BuildingGridItem({
   building,
   buildCount,
   onClick,
   onMouseOver,
   onMouseLeave,
}: {
   building: Building;
   buildCount: number;
   onClick: (b: Building) => void;
   onMouseOver: (b: Building) => void;
   onMouseLeave: (b: Building) => void;
}): React.ReactNode {
   return (
      <Tippy
         content={
            <>
               {buildCount > 0 ? (
                  <div className="text-strong">{t(L.XBuildingsWillBeBuilt, { count: buildCount })}</div>
               ) : null}
               <BuildingInfoComponent building={building} />
            </>
         }
      >
         <div
            className="building-grid-item"
            onClick={onClick.bind(null, building)}
            onMouseOver={onMouseOver.bind(null, building)}
            onMouseLeave={onMouseLeave.bind(null, building)}
         >
            <div style={{ width: 50, height: 50 }} className="row cc">
               <BuildingSpriteComponent building={building} scale={0.5} style={{ filter: "invert(0.75)" }} />
            </div>
            <div
               className="text-strong"
               style={{
                  width: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "center",
               }}
            >
               {Config.Building[building].name()}
            </div>
         </div>
      </Tippy>
   );
}

const BuildingGridItem = memo(_BuildingGridItem, (prev, next) => {
   return (
      prev.building === next.building &&
      prev.buildCount === next.buildCount &&
      prev.onClick === next.onClick &&
      prev.onMouseOver === next.onMouseOver &&
      prev.onMouseLeave === next.onMouseLeave
   );
});
