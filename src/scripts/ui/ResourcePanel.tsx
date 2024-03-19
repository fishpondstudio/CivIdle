import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { getScienceFromWorkers, isSpecialBuilding } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { getHappinessIcon } from "../../../shared/logic/HappinessLogic";
import { getSpecialBuildings } from "../../../shared/logic/IntraTickCache";
import { getProgressTowardsNextGreatPerson } from "../../../shared/logic/RebornLogic";
import { getResourceAmount } from "../../../shared/logic/ResourceLogic";
import { CurrentTickChanged } from "../../../shared/logic/TickLogic";
import {
   Rounding,
   clamp,
   formatPercent,
   mathSign,
   round,
   sizeOf,
   type Tile,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { useCurrentTick } from "../logic/ClientUpdate";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { useTypedEvent } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playClick, playError } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { TilePage } from "./TilePage";

export function ResourcePanel(): React.ReactNode {
   const tick = useCurrentTick();
   const gs = useGameState();
   const [empireValues, setEmpireValues] = useState<[number, number]>([tick.totalValue, tick.totalValue]);
   useTypedEvent(CurrentTickChanged, (current) => {
      setEmpireValues([current.totalValue, empireValues[0]]);
   });
   const { workersAfterHappiness, workersBusy } = getScienceFromWorkers(gs);
   const highlightNotProducingReasons = () => {
      const buildingTiles: Tile[] = Array.from(tick.notProducingReasons.keys());
      Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, buildingTiles);
   };
   const delta = empireValues[0] - empireValues[1];
   const [favoriteActive, setFavoriteActive] = useState(false);
   useEffect(() => {
      function onPointerDown(e: PointerEvent) {
         setFavoriteActive(false);
      }
      window.addEventListener("pointerdown", onPointerDown);
      return () => {
         window.removeEventListener("pointerdown", onPointerDown);
      };
   }, []);
   gs.favoriteTiles.forEach((tile) => {
      if (!gs.tiles.get(tile)?.building) {
         gs.favoriteTiles.delete(tile);
      }
   });
   return (
      <div className="resource-bar window">
         <div className={classNames({ "menu-button": true, active: favoriteActive })}>
            <div
               onPointerDown={(e) => {
                  if (gs.favoriteTiles.size === 0) {
                     playError();
                     showToast(t(L.FavoriteBuildingEmptyToast));
                     return;
                  }
                  e.nativeEvent.stopPropagation();
                  setFavoriteActive(!favoriteActive);
               }}
               className={classNames({ "m-icon fill text-orange": true })}
            >
               kid_star
            </div>
            <div className={classNames({ "menu-popover": true, active: favoriteActive })}>
               {Array.from(gs.favoriteTiles)
                  .sort((a, b) => {
                     return Config.Building[gs.tiles.get(a)!.building!.type]
                        .name()
                        .localeCompare(Config.Building[gs.tiles.get(b)!.building!.type].name());
                  })
                  .map((tile) => {
                     const building = gs.tiles.get(tile)?.building;
                     if (!building) return null;
                     return (
                        <div
                           key={tile}
                           className="menu-popover-item row"
                           onPointerDown={() => {
                              playClick();
                              Singleton()
                                 .sceneManager.getCurrent(WorldScene)
                                 ?.lookAtTile(tile, LookAtMode.Select);
                           }}
                        >
                           <div className="f1">{Config.Building[building.type].name()}</div>
                           {!isSpecialBuilding(building.type) ? (
                              <span className="ml10 text-small text-desc">
                                 {t(L.LevelX, { level: building.level })}
                              </span>
                           ) : null}
                        </div>
                     );
                  })}
            </div>
         </div>
         <div className="separator-vertical" />
         {tick.happiness ? (
            <div
               className="row pointer"
               onClick={() => {
                  const xy = getSpecialBuildings(gs).Headquarter.tile;
                  Singleton().sceneManager.getCurrent(WorldScene)?.lookAtTile(xy, LookAtMode.Select);
                  Singleton().routeTo(TilePage, { xy, expandHappiness: true });
               }}
            >
               <div
                  className={classNames({
                     "m-icon": true,
                     "text-red": tick.happiness.value < 0,
                     "text-green": tick.happiness.value > 0,
                  })}
               >
                  {getHappinessIcon(tick.happiness.value)}
               </div>
               <Tippy placement="bottom" content={t(L.Happiness)}>
                  <div style={{ width: "5rem" }}>{round(tick.happiness.value, 0)}</div>
               </Tippy>
            </div>
         ) : null}
         <div className="separator-vertical" />
         <div className="row">
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               person
            </div>
            <Tippy content={`${t(L.WorkersBusy)} / ${t(L.TotalWorkers)}`} placement="bottom">
               <div style={{ width: "12rem" }}>
                  <FormatNumber value={workersBusy} /> / <FormatNumber value={workersAfterHappiness} />
               </div>
            </Tippy>
         </div>
         <div className="separator-vertical" />
         {hasFeature(GameFeature.Electricity, gs) ? (
            <>
               <div className="row">
                  <div
                     className={classNames({
                        "m-icon": true,
                        "text-red":
                           (tick.workersAvailable.get("Power") ?? 0) < (tick.workersUsed.get("Power") ?? 0),
                        "text-green":
                           (tick.workersAvailable.get("Power") ?? 0) > (tick.workersUsed.get("Power") ?? 0),
                     })}
                  >
                     bolt
                  </div>
                  <Tippy placement="bottom" content={`${t(L.PowerUsed)}/${t(L.PowerAvailable)}`}>
                     <div style={{ width: "14rem" }}>
                        <FormatNumber value={tick.workersUsed.get("Power") ?? 0} />W{" / "}
                        <FormatNumber value={tick.workersAvailable.get("Power") ?? 0} />W
                     </div>
                  </Tippy>
               </div>
               <div className="separator-vertical" />
            </>
         ) : null}
         <div className="row pointer" onClick={() => Singleton().sceneManager.loadScene(TechTreeScene)}>
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               science
            </div>
            <Tippy content={t(L.Science)} placement="bottom">
               <div style={{ width: "6rem" }}>
                  <FormatNumber value={getResourceAmount("Science", gs)} />
               </div>
            </Tippy>
         </div>
         <div className="separator-vertical" />
         <div className="row pointer" onClick={() => highlightNotProducingReasons()}>
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               domain_disabled
            </div>
            <Tippy content={t(L.NotProducingBuildings)} placement="bottom">
               <div style={{ width: "6rem" }}>
                  <FormatNumber value={sizeOf(tick.notProducingReasons)} />
               </div>
            </Tippy>
         </div>
         <div className="separator-vertical" />
         <div className="row">
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               account_balance
            </div>
            <Tippy content={t(L.TotalEmpireValue)} placement="bottom">
               <div style={{ width: "6rem" }}>
                  <FormatNumber value={tick.totalValue} />
               </div>
            </Tippy>
            <div
               className={classNames({ "text-red": delta < 0, "text-green": delta > 0 })}
               style={{ width: "6rem", fontWeight: "normal", textAlign: "left" }}
            >
               {mathSign(delta)}
               <FormatNumber value={Math.abs(delta)} />
            </div>
            <Tippy content={t(L.ProgressTowardsNextGreatPerson)}>
               <div className="text-desc text-right" style={{ width: "4rem", fontWeight: "normal" }}>
                  {formatPercent(clamp(getProgressTowardsNextGreatPerson(), 0, 1), 0, Rounding.Floor)}
               </div>
            </Tippy>
         </div>
      </div>
   );
}
