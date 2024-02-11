import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { getScienceFromWorkers } from "../../../shared/logic/BuildingLogic";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { getHappinessIcon } from "../../../shared/logic/HappinessLogic";
import { getSpecialBuildings } from "../../../shared/logic/IntraTickCache";
import { getProgressTowardsNextGreatPerson } from "../../../shared/logic/RebornLogic";
import { getResourceAmount } from "../../../shared/logic/ResourceLogic";
import { clamp, sizeOf, type Tile } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { useCurrentTick } from "../logic/Tick";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { FormatNumber } from "./HelperComponents";
import { TilePage } from "./TilePage";

export function ResourcePanel(): React.ReactNode {
   const tick = useCurrentTick();
   const gs = useGameState();
   const { workersAvailableAfterHappiness, workersBusy } = getScienceFromWorkers(gs);

   const highlightNotProducingReasons = () => {
      const buildingTiles: Tile[] = Array.from(tick.notProducingReasons.keys());
      Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, buildingTiles);
   };
   return (
      <div className="resource-bar window">
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
                  <div style={{ width: "50px" }}>{tick.happiness.value}</div>
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
            <Tippy content={`${t(L.WorkersBusy)} / ${t(L.WorkersAvailable)}`} placement="bottom">
               <div style={{ width: "120px" }}>
                  <FormatNumber value={workersBusy} /> /{" "}
                  <FormatNumber value={workersAvailableAfterHappiness} />
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
                        "text-red": (tick.workersAvailable.Power ?? 0) < (tick.workersUsed.Power ?? 0),
                        "text-green": (tick.workersAvailable.Power ?? 0) > (tick.workersUsed.Power ?? 0),
                     })}
                  >
                     bolt
                  </div>
                  <Tippy placement="bottom" content={`${t(L.PowerUsed)}/${t(L.PowerAvailable)}`}>
                     <div style={{ width: "120px" }}>
                        <FormatNumber value={tick.workersUsed.Power ?? 0} />W{" / "}
                        <FormatNumber value={tick.workersAvailable.Power ?? 0} />W
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
               <div style={{ width: "60px" }}>
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
               <div style={{ width: "60px" }}>
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
               <div style={{ width: "60px" }}>
                  <FormatNumber value={tick.totalValue} />
               </div>
            </Tippy>
            <Tippy content={t(L.ProgressTowardsNextGreatPerson)}>
               <div className="text-desc text-right" style={{ width: "30px", fontWeight: "normal" }}>
                  {Math.floor(clamp(getProgressTowardsNextGreatPerson(), 0, 1) * 100)}%
               </div>
            </Tippy>
         </div>
      </div>
   );
}
