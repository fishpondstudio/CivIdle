import Tippy from "@tippyjs/react";
import { useState } from "react";
import type { Resource, ResourceDefinitions } from "../../../shared/definitions/ResourceDefinitions";
import {
   getTotalBuildingCost,
   getUpgradeTargetLevels,
   isSpecialBuilding,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getGrid, unlockedResources } from "../../../shared/logic/IntraTickCache";
import { Tick } from "../../../shared/logic/TickLogic";
import {
   formatNumber,
   keysOf,
   mapOf,
   numberToRoman,
   pointToTile,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import type { PartialSet, PartialTabulate } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingUpgradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (!building) {
      return null;
   }
   if ((Config.Building[building.type]?.max ?? Number.POSITIVE_INFINITY) <= 1) {
      return null;
   }
   const [selected, setSelected] = useState(new Set([xy]));
   const levels = getUpgradeTargetLevels(building);
   const upgradeTo = (targetLevel: number) => {
      selected.forEach((xy) => {
         const b = gameState.tiles.get(xy)?.building;
         if (!b) return;
         const target = targetLevel < 0 ? b.level + Math.abs(targetLevel) : targetLevel;
         if (!isSpecialBuilding(b.type) && target > b.level) {
            b.desiredLevel = target;
            b.status = "upgrading";
         }
      });
      notifyGameStateUpdate();
   };
   useShortcut("BuildingPageUpgrade1", () => upgradeTo(levels[0]), [xy]);
   useShortcut("BuildingPageUpgrade2", () => upgradeTo(levels[1]), [xy]);
   useShortcut("BuildingPageUpgrade3", () => upgradeTo(levels[2]), [xy]);
   useShortcut("BuildingPageUpgrade4", () => upgradeTo(levels[3]), [xy]);
   useShortcut("BuildingPageUpgrade5", () => upgradeTo(levels[4]), [xy]);
   const age = Config.BuildingTechAge[building.type]!;

   const selectRange = (range: number, sameType: boolean) => {
      const result = new Set<Tile>();
      getGrid(gameState)
         .getRange(tileToPoint(xy), range)
         .forEach((point) => {
            const xy = pointToTile(point);
            const tile = gameState.tiles.get(xy);
            if (
               tile?.building &&
               !isSpecialBuilding(tile.building.type) &&
               tile.building.status !== "building" &&
               (!sameType || tile.building.type === building.type)
            ) {
               result.add(xy);
            }
         });
      setSelected(result);
      Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, Array.from(result));
   };

   const unlockedResourcesList: PartialSet<Resource> = unlockedResources(gameState);
   const resourceAmounts: Partial<Record<keyof ResourceDefinitions, number>> = {};

   keysOf(unlockedResourcesList).map((res) => {
      resourceAmounts[res] =
         Tick.current.resourcesByTile
            .get(res)
            ?.reduce(
               (prev, curr) => prev + (gameState.tiles.get(curr.tile)?.building?.resources?.[res] ?? 0),
               0,
            ) ?? 0;
   });

   const buildCost = (idx: number, level: number) => {
      const resCost: PartialTabulate<Resource> = {};

      selected.forEach((xy) => {
         const b = gameState.tiles.get(xy)?.building;
         if (!b) return;
         mapOf(getTotalBuildingCost(b.type, b.level, level), (res, amount) => {
            if (res in resCost) {
               resCost[res] = resCost[res]! + amount;
            } else {
               resCost[res] = amount;
            }
         });
      });

      return (
         <span>
            {idx === 0 ? `${t(L.Upgrade)} +1: ` : `${t(L.UpgradeTo, { level })}: `}
            {keysOf(resCost).map((item, idx) => {
               return (
                  <>
                     <span className={resourceAmounts[item]! < resCost[item]! ? "text-red" : ""}>
                        {Config.Resource[item].name()} {formatNumber(resCost[item])}
                     </span>
                     {idx < keysOf(resCost).length - 1 ? ", " : ""}
                  </>
               );
            })}
         </span>
      );
   };

   return (
      <>
         <fieldset>
            <div className="row">
               <div className="f1 text-center">
                  <div className="text-strong text-large">{building.level}</div>
                  <div className="text-small text-desc">{t(L.Level)}</div>
               </div>
               <div className="f1 text-center">
                  <div className="text-strong text-large">
                     {numberToRoman(Config.BuildingTier[building.type]!)}
                  </div>
                  <div className="text-small text-desc">{t(L.BuildingTier)}</div>
               </div>
               <Tippy content={Config.TechAge[age].name()}>
                  <div className="f1 text-center">
                     <div className="text-strong text-large">
                        {numberToRoman(Config.TechAge[age].idx + 1)}
                     </div>
                     <div className="text-small text-desc">{t(L.TechAge)}</div>
                  </div>
               </Tippy>
            </div>
            <div className="separator" />
            <div className="row text-small text-strong">
               <Tippy content={t(L.BatchModeTooltip, { count: selected.size })}>
                  <div>
                     {t(L.BatchUpgrade)}: {selected.size}
                  </div>
               </Tippy>
               <div className="f1"></div>
               <select
                  style={{ margin: "-10px 0" }}
                  className="condensed"
                  defaultValue={0}
                  onChange={(e) => {
                     switch (e.target.value) {
                        case "0": {
                           setSelected(new Set([xy]));
                           Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null);
                           break;
                        }
                        case "1": {
                           const result = new Set<Tile>();
                           gameState.tiles.forEach((tile, xy) => {
                              if (
                                 tile?.building?.type === building.type &&
                                 tile.building.status !== "building"
                              ) {
                                 result.add(xy);
                              }
                           });
                           setSelected(result);
                           Singleton()
                              .sceneManager.getCurrent(WorldScene)
                              ?.drawSelection(null, Array.from(result));
                           break;
                        }
                        case "2":
                           selectRange(1, true);
                           break;
                        case "3":
                           selectRange(2, true);
                           break;
                        case "4":
                           selectRange(3, true);
                           break;
                        case "5":
                           selectRange(1, false);
                           break;
                        case "6":
                           selectRange(2, false);
                           break;
                        case "7":
                           selectRange(3, false);
                           break;
                     }
                  }}
               >
                  <option value={0}>{t(L.BatchSelectThisBuilding)}</option>
                  <option value={1}>{t(L.BatchSelectAllSameType)}</option>
                  <option value={2}>{t(L.BatchSelectSameType1Tile)}</option>
                  <option value={3}>{t(L.BatchSelectSameType2Tile)}</option>
                  <option value={4}>{t(L.BatchSelectSameType3Tile)}</option>
                  <option value={5}>{t(L.BatchSelectAnyType1Tile)}</option>
                  <option value={6}>{t(L.BatchSelectAnyType2Tile)}</option>
                  <option value={7}>{t(L.BatchSelectAnyType3Tile)}</option>
               </select>
            </div>
            <div className="separator" />
            <div className="row">
               {levels.map((level, idx) => (
                  <Tippy key={idx} content={buildCost(idx, level)} placement="top">
                     <button className="f1" onClick={() => upgradeTo(idx === 0 ? -1 : level)}>
                        {idx === 0 ? "+1" : `~${level}`}
                     </button>
                  </Tippy>
               ))}
            </div>
         </fieldset>
      </>
   );
}
