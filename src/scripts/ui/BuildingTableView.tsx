import { TableVirtuoso } from "react-virtuoso";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { getBuildingCost } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import type { getTypeBuildings } from "../../../shared/logic/IntraTickCache";
import type { ITileData } from "../../../shared/logic/Tile";
import {
   formatNumber,
   isEmpty,
   numberToRoman,
   setContains,
   sizeOf,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { jsxMapOf } from "../utilities/Helper";
import { useForceUpdate } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { LazyTippy } from "./LazyTippy";
import { ResourceAmountComponent } from "./ResourceAmountComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { BuildingSpriteComponent } from "./TextureSprites";

const savedSorting = { column: 0, asc: true };

function extractsDeposit(building: Building, tile: ITileData): boolean {
   const deposit = Config.Building[building].deposit;
   return !!deposit && setContains(tile.deposit, deposit);
}

function compareBuildings(a: Building, b: Building, col: number, tile: ITileData): number {
   const aDeposit = extractsDeposit(a, tile);
   const bDeposit = extractsDeposit(b, tile);
   if (aDeposit && !bDeposit) {
      return -1;
   }
   if (!aDeposit && bDeposit) {
      return 1;
   }
   if (col === 2) {
      return Config.Building[a].name().localeCompare(Config.Building[b].name());
   }
   const diff = (Config.BuildingTier[a] ?? 0) - (Config.BuildingTier[b] ?? 0);
   if (diff !== 0) {
      return diff;
   }
   return Config.Building[a].name().localeCompare(Config.Building[b].name());
}

export function BuildingTableView({
   buildings,
   buildCount,
   lastBuild,
   tile,
   gs,
   buildingByType,
   onBuild,
   onMouseOver,
   onMouseLeave,
}: {
   buildings: Building[];
   buildCount: number;
   lastBuild: Building | null;
   tile: ITileData;
   gs: GameState;
   buildingByType: ReturnType<typeof getTypeBuildings>;
   onBuild: (b: Building) => void;
   onMouseOver: (b: Building) => void;
   onMouseLeave: (b: Building) => void;
}): React.ReactNode {
   const forceUpdate = useForceUpdate();
   const sorted = [...buildings].sort((a, b) => {
      const o = savedSorting.asc ? 1 : -1;
      return o * compareBuildings(a, b, savedSorting.column, tile);
   });
   if (sorted.length === 0) {
      return <div className="table-view f1 col cc text-desc">{$t(L.NothingHere)}</div>;
   }
   return (
      <div className="table-view building-list f1" style={{ minHeight: 0 }}>
         <TableVirtuoso
            style={{ height: "100%" }}
            data={sorted}
            computeItemKey={(_index, building) => building}
            fixedHeaderContent={() => (
               <tr>
                  <th
                     onClick={() => {
                        savedSorting.column = 0;
                        savedSorting.asc = !savedSorting.asc;
                        forceUpdate();
                     }}
                  >
                     <div className="row">
                        <div>{$t(L.BuildingTier)}</div>
                        {savedSorting.column === 0 ? (
                           <div className="m-icon small">
                              {savedSorting.asc ? "arrow_upward" : "arrow_downward"}
                           </div>
                        ) : null}
                     </div>
                  </th>
                  <th></th>
                  <th
                     onClick={() => {
                        savedSorting.column = 2;
                        savedSorting.asc = !savedSorting.asc;
                        forceUpdate();
                     }}
                  >
                     <div className="row">
                        <div>{$t(L.BuildingName)}</div>
                        {savedSorting.column === 2 ? (
                           <div className="m-icon small">
                              {savedSorting.asc ? "arrow_upward" : "arrow_downward"}
                           </div>
                        ) : null}
                     </div>
                  </th>
                  <th></th>
               </tr>
            )}
            itemContent={(_index, k) => (
               <BuildingTableRow
                  buildingType={k}
                  buildCount={buildCount}
                  lastBuild={lastBuild}
                  tile={tile}
                  gs={gs}
                  buildingByType={buildingByType}
                  onBuild={onBuild}
                  onMouseOver={onMouseOver}
                  onMouseLeave={onMouseLeave}
               />
            )}
         />
      </div>
   );
}

function BuildingTableRow({
   buildingType,
   buildCount,
   lastBuild,
   tile,
   gs,
   buildingByType,
   onBuild,
   onMouseOver,
   onMouseLeave,
}: {
   buildingType: Building;
   buildCount: number;
   lastBuild: Building | null;
   tile: ITileData;
   gs: GameState;
   buildingByType: ReturnType<typeof getTypeBuildings>;
   onBuild: (b: Building) => void;
   onMouseOver: (b: Building) => void;
   onMouseLeave: (b: Building) => void;
}): React.ReactNode {
   const building = Config.Building[buildingType];
   const buildCost = getBuildingCost({
      type: buildingType,
      level: 0,
   });
   return (
      <>
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
                     gs.tiles.forEach((t, xy) => {
                        if (t.building?.type === buildingType) {
                           result.push(xy);
                        }
                     });
                     Singleton()
                        .sceneManager.getCurrent(WorldScene)
                        ?.drawSelection(tileToPoint(tile.tile), result);
                  }}
               >
                  {numberToRoman(Config.BuildingTier[buildingType] ?? 1)}
               </div>
            )}
         </td>
         <td width={1}>
            <BuildingSpriteComponent building={buildingType} scale={0.5} style={{ filter: "invert(0.75)" }} />
         </td>
         <td>
            <div className="row">
               <div>
                  <span className="text-strong">{building.name()}</span>
                  {building.max === 1 ? null : (
                     <span className="text-desc text-small ml5">
                        {sizeOf(buildingByType.get(buildingType))}
                     </span>
                  )}
               </div>
               {extractsDeposit(buildingType, tile) ? (
                  <LazyTippy content={$t(L.BuildingExtractDeposit)}>
                     <div className="m-icon small text-orange ml5">stars</div>
                  </LazyTippy>
               ) : null}
               {buildingType === lastBuild ? (
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
                  {isEmpty(building.input) ? null : <div className="m-icon small mr2 fs">exit_to_app</div>}
                  <div>
                     {jsxMapOf(building.input, (res, amount) => (
                        <span key={res} className="mr5">
                           {Config.Material[res].name()} x{formatNumber(amount)}
                        </span>
                     ))}
                  </div>
               </div>
               <div className="row text-small text-desc">
                  {isEmpty(building.output) ? null : <div className="m-icon small mr2 fs">output</div>}
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
                     <div>{$t(L.RequirePower)}</div>
                  </div>
               ) : null}
            </div>
         </td>
         <td style={{ width: 0 }}>
            <LazyTippy content={$t(L.XBuildingsWillBeBuilt, { count: buildCount })}>
               <div
                  className="text-link text-strong"
                  onClick={() => onBuild(buildingType)}
                  onMouseOver={() => onMouseOver(buildingType)}
                  onMouseLeave={() => onMouseLeave(buildingType)}
               >
                  {$t(L.Build)}
               </div>
            </LazyTippy>
         </td>
      </>
   );
}
