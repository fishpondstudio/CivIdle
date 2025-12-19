import Tippy from "@tippyjs/react";
import { Fragment, useEffect, useState } from "react";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import {
   getTotalBuildingCost,
   getUpgradeTargetLevels,
   isSpecialBuilding,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { clearIntraTickCache, getGrid } from "../../../shared/logic/IntraTickCache";
import { RequestResetTile } from "../../../shared/logic/TechLogic";
import { NotProducingReason, Tick } from "../../../shared/logic/TickLogic";
import type { IBuildingData } from "../../../shared/logic/Tile";
import { clearTransportSourceCache } from "../../../shared/logic/Update";
import {
   formatNumber,
   keysOf,
   mapOf,
   numberToRoman,
   pointToTile,
   safeAdd,
   tileToPoint,
   type Tile,
} from "../../../shared/utilities/Helper";
import type { PartialTabulate } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playClick, playError, playSuccess } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { hideToast, showToast } from "./GlobalModal";

//export type UpgradeState = "all" | "active" | "disabled";

export function BuildingUpgradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (!building) {
      return null;
   }
   if ((Config.Building[building.type]?.max ?? Number.POSITIVE_INFINITY) <= 1) {
      return null;
   }
   const [upgradeState, setUpgradeState] = useState<string>("0");
   const [upgradeRange, setUpgradeRange] = useState<string>("0");
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
      setSelected(new Set([xy]));
      Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, Array.from(selected));
      notifyGameStateUpdate();
   };
   useShortcut("BuildingPageUpgrade1", () => upgradeTo(levels[0]), [xy]);
   useShortcut("BuildingPageUpgrade2", () => upgradeTo(levels[1]), [xy]);
   useShortcut("BuildingPageUpgrade3", () => upgradeTo(levels[2]), [xy]);
   useShortcut("BuildingPageUpgrade4", () => upgradeTo(levels[3]), [xy]);
   useShortcut("BuildingPageUpgrade5", () => upgradeTo(levels[4]), [xy]);
   useEffect(() => {
      highlightUpgradeableBuildings(upgradeRange, upgradeState);
   }, [upgradeState, upgradeRange]);

   const age = Config.BuildingTechAge[building.type]!;

   const [moving, setMoving] = useState(false);
   const theMet = Tick.current.specialBuildings.get("TheMet");

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
               (!sameType || tile.building.type === building.type) &&
               stateCondition(tile.building, xy)
            ) {
               result.add(xy);
            }
         });
      setSelected(result);
      Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, Array.from(result));
   };

   const buildCost = (idx: number, level: number) => {
      const resCost: PartialTabulate<Material> = {};

      selected.forEach((xy) => {
         const b = gameState.tiles.get(xy)?.building;
         if (!b) return;
         mapOf(getTotalBuildingCost(b, b.level, idx === 0 ? b.level + 1 : level), (res, amount) => {
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
                  <Fragment key={item}>
                     {idx === 0 ? "" : ", "}
                     <span
                        className={
                           (Tick.current.resourceAmount.get(item) ?? 0) < resCost[item]! ? "text-red" : ""
                        }
                     >
                        {Config.Material[item].name()} {formatNumber(resCost[item])}
                     </span>
                  </Fragment>
               );
            })}
         </span>
      );
   };

   const stateCondition = (b: IBuildingData, xy: Tile) => {
      switch (upgradeState) {
         case "0": // All buildings
            return true;
         case "1": //  Active buildings
            return b.capacity > 0;
         case "2": // Turned off buildings
            return b.capacity === 0;
         case "3": // Buildings that have full storage
            return Tick.current.notProducingReasons.get(xy) === NotProducingReason.StorageFull;
      }
   };

   const highlightUpgradeableBuildings = (upgradeRange: string, upgradeState: string) => {
      switch (upgradeRange) {
         case "0": {
            if (stateCondition(building, xy)) {
               setSelected(new Set([xy]));
               Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, []);
            }
            break;
         }
         case "1": {
            const result = new Set<Tile>();
            gameState.tiles.forEach((tile, xy) => {
               if (
                  tile?.building?.type === building.type &&
                  tile.building.status !== "building" &&
                  stateCondition(tile.building, xy)
               ) {
                  result.add(xy);
               }
            });
            setSelected(result);
            Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, Array.from(result));
            break;
         }
         case "2": {
            const result = new Set<Tile>();
            gameState.tiles.forEach((tile, xy) => {
               if (
                  tile?.building?.type === building.type &&
                  tile.building.status !== "building" &&
                  tile.building.level === building.level &&
                  stateCondition(tile.building, xy)
               ) {
                  result.add(xy);
               }
            });
            setSelected(result);
            Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, Array.from(result));
            break;
         }
         case "3":
            selectRange(1, true);
            break;
         case "4":
            selectRange(2, true);
            break;
         case "5":
            selectRange(3, true);
            break;
         case "6":
            selectRange(1, false);
            break;
         case "7":
            selectRange(2, false);
            break;
         case "8":
            selectRange(3, false);
            break;
      }
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
                  className="condensed mr5"
                  defaultValue={0}
                  onChange={(e) => {
                     setUpgradeState(e.target.value);
                  }}
               >
                  <option value={0}>{t(L.BatchStateSelectAll)}</option>
                  <option value={1}>{t(L.BatchStateSelectActive)}</option>
                  <option value={2}>{t(L.BatchStateSelectTurnedOff)}</option>
                  <option value={3}>{t(L.BatchStateSelectTurnedFullStorage)}</option>
               </select>
               <select
                  style={{ margin: "-10px 0" }}
                  className="condensed"
                  defaultValue={0}
                  onChange={(e) => {
                     setUpgradeRange(e.target.value);
                  }}
               >
                  <option value={0}>{t(L.BatchSelectThisBuilding)}</option>
                  <option value={1}>{t(L.BatchSelectAllSameType)}</option>
                  <option value={2}>{t(L.BatchSelectSameTypeSameLevel)}</option>
                  <option value={3}>{t(L.BatchSelectSameType1Tile)}</option>
                  <option value={4}>{t(L.BatchSelectSameType2Tile)}</option>
                  <option value={5}>{t(L.BatchSelectSameType3Tile)}</option>
                  <option value={6}>{t(L.BatchSelectAnyType1Tile)}</option>
                  <option value={7}>{t(L.BatchSelectAnyType2Tile)}</option>
                  <option value={8}>{t(L.BatchSelectAnyType3Tile)}</option>
               </select>
            </div>
            <div className="separator" />
            <div className="row">
               {levels.map((level, idx) => (
                  <Tippy key={idx} content={buildCost(idx, level)}>
                     <button className="f1" onClick={() => upgradeTo(idx === 0 ? -1 : level)}>
                        {idx === 0 ? "+1" : `~${level}`}
                     </button>
                  </Tippy>
               ))}
            </div>
            {theMet ? (
               <button
                  className="row w100 jcc mt5"
                  disabled={moving || (theMet.building.resources.Teleport ?? 0) <= 0}
                  onClick={async () => {
                     playClick();
                     showToast(t(L.MoveBuildingSelectTileToastHTML), Number.POSITIVE_INFINITY);
                     setMoving(true);
                     const point = await Singleton().sceneManager.getCurrent(WorldScene)?.hijackSelectGrid();
                     hideToast();
                     setMoving(false);
                     if (!point || moving || (theMet.building.resources.Teleport ?? 0) <= 0) {
                        playError();
                        return;
                     }
                     const xy = pointToTile(point);
                     const newTile = gameState.tiles.get(xy);
                     if (newTile && !newTile.building && newTile.explored) {
                        playSuccess();
                        newTile.building = building;
                        safeAdd(theMet.building.resources, "Teleport", -1);
                        delete tile.building;
                        RequestResetTile.emit(tile.tile);
                        RequestResetTile.emit(newTile.tile);
                        notifyGameStateUpdate();
                        clearTransportSourceCache();
                        clearIntraTickCache();
                        Singleton().sceneManager.getCurrent(WorldScene)?.selectGrid(point);
                     } else {
                        showToast(L.MoveBuildingFail);
                        playError();
                     }
                  }}
               >
                  <div className="m-icon small">zoom_out_map</div>
                  <Tippy
                     content={t(L.MoveBuildingNoTeleport)}
                     disabled={(theMet.building.resources.Teleport ?? 0) > 0}
                  >
                     <div className="f1">{moving ? t(L.MoveBuildingSelectTile) : t(L.MoveBuilding)}</div>
                  </Tippy>
               </button>
            ) : null}
         </fieldset>
      </>
   );
}
