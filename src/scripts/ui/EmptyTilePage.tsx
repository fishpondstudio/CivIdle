import { useCallback, useState } from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import {
   applyBuildingDefaults,
   checkBuildingMax,
   isSpecialBuilding,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getGrid, getTypeBuildings, unlockedBuildings } from "../../../shared/logic/IntraTickCache";
import type { ITileData } from "../../../shared/logic/Tile";
import { makeBuilding } from "../../../shared/logic/Tile";
import {
   anyOf,
   cls,
   hasFlag,
   keysOf,
   numberToRoman,
   pointToTile,
   range,
   sizeOf,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import "../../css/EmptyTilePage.css";
import { useGameState } from "../Global";
import { WorldScene } from "../scenes/WorldScene";
import { jsxMapOf } from "../utilities/Helper";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playClick, playError } from "../visuals/Sound";
import { BuildingGridView } from "./BuildingGridView";
import { BuildingTableView } from "./BuildingTableView";
import { BuildingFilter, Filter } from "./FilterComponent";
import { LazyTippy } from "./LazyTippy";
import { MenuComponent } from "./MenuComponent";
import { TitleBarComponent } from "./TitleBarComponent";

let lastBuild: Building | null = null;
let savedFilter = BuildingFilter.None;
let lastBuildRange = 0;

export function EmptyTilePage({ tile }: { tile: ITileData }): React.ReactNode {
   const gs = useGameState();
   const options = getGameOptions();
   const [buildingFilter, _setBuildingFilter] = useState<BuildingFilter>(savedFilter);
   const setBuildingFilter = (newFilter: BuildingFilter) => {
      _setBuildingFilter(newFilter);
      savedFilter = newFilter;
   };
   const [buildCount, setBuildCount] = useState<number>(1);
   const [search, setSearch] = useState<string>("");
   const constructed = getTypeBuildings(gs);
   const [buildRange, setBuildRange] = useState<number>(lastBuildRange);
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

   return (
      <div className="window">
         <TitleBarComponent>{$t(L.Tile)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body f1 col" style={{ minHeight: 0, overflow: "hidden" }}>
            {sizeOf(tile.deposit) > 0 ? (
               <div className="row inset-shallow-2 mb5" style={{ padding: "0 5px" }}>
                  <div className="f1 text-strong">{$t(L.Deposit)}</div>
                  {jsxMapOf(tile.deposit, (k) => {
                     return (
                        <button
                           key={k}
                           className="mv5"
                           onClick={() => {
                              const result: Tile[] = [];
                              gs.tiles.forEach((t, xy) => {
                                 if (t.explored && t.deposit[k]) {
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
                  placeholder={$t(L.BuildingSearchText)}
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
               <LazyTippy
                  content={
                     buildRange === 0
                        ? $t(L.BuildWithin0TileRange)
                        : $t(L.BuildWithinXTileRange, { range: buildRange })
                  }
               >
                  <select
                     value={buildRange}
                     onChange={(e) => {
                        playClick();
                        const selectedValue = Number.parseInt(e.target.value);
                        setBuildRange(selectedValue);
                        if (options.rememberLastBuildRange) {
                           lastBuildRange = selectedValue;
                        } else {
                           lastBuildRange = 0;
                        }
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
               </LazyTippy>
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
                  tooltip={$t(L.ShowUnbuiltOnly)}
                  filter={buildingFilter}
                  current={BuildingFilter.NotBuilt}
                  savedFilter={savedFilter}
                  onFilterChange={setBuildingFilter}
               >
                  <div className="m-icon small">lightbulb</div>
               </Filter>
            </div>
            {options.constructionGridView ? (
               <BuildingGridView
                  buildings={filteredBuildings}
                  buildCount={buildCount}
                  onClick={build}
                  onMouseOver={onMouseOver}
                  onMouseLeave={onMouseLeave}
               />
            ) : (
               <BuildingTableView
                  buildings={filteredBuildings}
                  buildCount={buildCount}
                  lastBuild={lastBuild}
                  tile={tile}
                  gs={gs}
                  buildingByType={buildingByType}
                  onBuild={build}
                  onMouseOver={onMouseOver}
                  onMouseLeave={onMouseLeave}
               />
            )}
         </div>
      </div>
   );
}
