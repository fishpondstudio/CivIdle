import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import {
   getMaxWarpSpeed,
   getScienceFromWorkers,
   isSpecialBuilding,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { FESTIVAL_CONVERSION_RATE } from "../../../shared/logic/Constants";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getHappinessIcon } from "../../../shared/logic/HappinessLogic";
import { getResourceIO } from "../../../shared/logic/IntraTickCache";
import {
   getProgressTowardsNextGreatPerson,
   getRebirthGreatPeopleCount,
} from "../../../shared/logic/RebirthLogic";
import { getResourceAmount } from "../../../shared/logic/ResourceLogic";
import { NotProducingReason, Tick } from "../../../shared/logic/TickLogic";
import {
   Rounding,
   clamp,
   formatHMS,
   formatNumber,
   formatPercent,
   mapCount,
   mathSign,
   range,
   round,
   type Tile,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { useCurrentTick } from "../logic/ClientUpdate";
import { TimeSeries } from "../logic/TimeSeries";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { playClick, playError } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { TilePage } from "./TilePage";

export function ResourcePanel(): React.ReactNode {
   const tick = useCurrentTick();
   const gs = useGameState();
   const options = useGameOptions();
   const { workersAfterHappiness, workersBusy } = getScienceFromWorkers(gs);
   const highlightNotProducingReasons = () => {
      const buildingTiles: Tile[] = Array.from(tick.notProducingReasons.entries())
         .filter(([_, reason]) => {
            if (options.resourceBarExcludeStorageFull && reason === NotProducingReason.StorageFull) {
               return false;
            }
            if (
               options.resourceBarExcludeTurnedOffOrNoActiveTransport &&
               (reason === NotProducingReason.TurnedOff || reason === NotProducingReason.NoActiveTransports)
            ) {
               return false;
            }
            return true;
         })
         .map(([xy]) => xy);
      Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, buildingTiles);
   };

   let evDelta = 0;
   let scienceDelta = 0;
   if (TimeSeries.science.length > 1) {
      evDelta =
         TimeSeries.empireValue[TimeSeries.empireValue.length - 1] -
         TimeSeries.empireValue[TimeSeries.empireValue.length - 2];
      scienceDelta =
         TimeSeries.science[TimeSeries.science.length - 1] -
         TimeSeries.science[TimeSeries.science.length - 2];
   }

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
               className="section pointer"
               onClick={() => {
                  const xy = Tick.current.specialBuildings.get("Headquarter")?.tile;
                  if (xy) {
                     Singleton().sceneManager.getCurrent(WorldScene)?.lookAtTile(xy, LookAtMode.Select);
                     Singleton().routeTo(TilePage, { xy, expandHappiness: true });
                  }
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
               <Tippy
                  placement="bottom"
                  content={options.resourceBarShowUncappedHappiness ? t(L.HappinessUncapped) : t(L.Happiness)}
               >
                  <div style={{ width: "4rem" }}>
                     {round(
                        options.resourceBarShowUncappedHappiness
                           ? tick.happiness.uncapped
                           : tick.happiness.value,
                        0,
                     )}
                  </div>
               </Tippy>
            </div>
         ) : null}
         <div className="separator-vertical" />
         <Tippy content={Config.City[gs.city].festivalDesc()}>
            <div
               className={classNames({ section: true, pointer: true, "text-orange": gs.festival })}
               onClick={() => {
                  playClick();
                  gs.festival = !gs.festival;
                  notifyGameStateUpdate();
               }}
            >
               <div className={classNames({ "m-icon": true })}>celebration</div>
               <div style={{ width: "5rem" }}>
                  <FormatNumber
                     value={Math.floor(
                        (Tick.current.specialBuildings.get("Headquarter")?.building.resources.Festival ?? 0) /
                           FESTIVAL_CONVERSION_RATE,
                     )}
                  />
               </div>
            </div>
         </Tippy>
         <div className="separator-vertical" />
         <div className="section">
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               person
            </div>
            <Tippy content={`${t(L.WorkersBusy)} / ${t(L.TotalWorkers)}`} placement="bottom">
               <div style={{ width: "10rem" }}>
                  <FormatNumber value={workersBusy} />/<FormatNumber value={workersAfterHappiness} />
               </div>
            </Tippy>
         </div>
         <div className="separator-vertical" />
         {hasFeature(GameFeature.Electricity, gs) ? (
            <>
               <div className="section">
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
                     <div style={{ width: "12rem" }}>
                        <FormatNumber value={tick.workersUsed.get("Power") ?? 0} />W{"/"}
                        <FormatNumber value={tick.workersAvailable.get("Power") ?? 0} />W
                     </div>
                  </Tippy>
               </div>
               <div className="separator-vertical" />
            </>
         ) : null}
         <div className="section pointer" onClick={() => Singleton().sceneManager.loadScene(TechTreeScene)}>
            <div className={classNames({ "m-icon": true })}>science</div>
            <Tippy content={t(L.Science)} placement="bottom">
               <div style={{ width: "12rem" }}>
                  <FormatNumber value={TimeSeries.science[TimeSeries.science.length - 1]} />
                  <span
                     className={classNames({
                        "text-red": scienceDelta < 0,
                        "text-green": scienceDelta > 0,
                     })}
                     style={{ fontWeight: "normal", textAlign: "left" }}
                  >
                     {mathSign(scienceDelta)}
                     <FormatNumber value={Math.abs(scienceDelta)} />
                  </span>
               </div>
            </Tippy>
         </div>
         <div className="separator-vertical" />
         <div className="section pointer" onClick={() => highlightNotProducingReasons()}>
            <div className={classNames({ "m-icon": true })}>domain_disabled</div>
            <Tippy content={t(L.NotProducingBuildings)} placement="bottom">
               <div style={{ width: "5rem" }}>
                  <FormatNumber
                     value={mapCount(tick.notProducingReasons, (v) => {
                        if (options.resourceBarExcludeStorageFull && v === NotProducingReason.StorageFull) {
                           return false;
                        }
                        if (
                           options.resourceBarExcludeTurnedOffOrNoActiveTransport &&
                           (v === NotProducingReason.TurnedOff || v === NotProducingReason.NoActiveTransports)
                        ) {
                           return false;
                        }
                        return true;
                     })}
                  />
               </div>
            </Tippy>
         </div>
         <div className="separator-vertical" />
         <DeficitResources />
         <div className="section">
            <div
               className={classNames({
                  "m-icon": true,
               })}
            >
               account_balance
            </div>
            <Tippy content={t(L.TotalEmpireValue)} placement="bottom">
               <div style={{ width: "12rem" }}>
                  <FormatNumber value={tick.totalValue} />
                  <span
                     className={classNames({ "text-red": evDelta < 0, "text-green": evDelta > 0 })}
                     style={{ fontWeight: "normal", textAlign: "left" }}
                  >
                     {mathSign(evDelta)}
                     <FormatNumber value={Math.abs(evDelta)} />
                  </span>
               </div>
            </Tippy>
         </div>
         <div className="separator-vertical" />
         <div className="section">
            <div className="m-icon small">person_celebrate</div>
            <div style={{ width: "8rem" }}>
               <Tippy content={t(L.ExtraGreatPeopleAtReborn)}>
                  <span>{getRebirthGreatPeopleCount()}</span>
               </Tippy>
               <Tippy content={t(L.ProgressTowardsNextGreatPerson)}>
                  <span className="text-desc" style={{ fontWeight: "normal", marginLeft: 5 }}>
                     ({formatPercent(clamp(getProgressTowardsNextGreatPerson(), 0, 1), 0, Rounding.Floor)})
                  </span>
               </Tippy>
            </div>
         </div>
         <div className="separator-vertical" />
         <div className="section" style={{ padding: "0 0.5rem" }}>
            <select
               value={gs.speedUp}
               onChange={(e) => {
                  gs.speedUp = clamp(Number.parseInt(e.target.value, 10), 1, getMaxWarpSpeed(gs));
                  notifyGameStateUpdate();
               }}
               style={{ paddingRight: "2.5rem" }}
            >
               {range(1, getMaxWarpSpeed(gs) + 1).map((i) => (
                  <option key={i} value={i}>
                     {i}x
                  </option>
               ))}
            </select>
         </div>
      </div>
   );
}

function DeficitResources(): React.ReactNode {
   const gs = useGameState();

   if (!Tick.current.specialBuildings.has("Statistics")) {
      return null;
   }

   const deficit = new Map<Resource, number>();
   const { theoreticalInput, theoreticalOutput } = getResourceIO(gs);
   theoreticalInput.forEach((input, res) => {
      const diff = (theoreticalOutput.get(res) ?? 0) - input;
      if (diff < 0) {
         deficit.set(res, diff);
      }
   });

   return (
      <>
         <div
            className="section pointer"
            onClick={() => {
               const s = Tick.current.specialBuildings.get("Statistics");
               if (s) {
                  Singleton().sceneManager.getCurrent(WorldScene)?.lookAtTile(s.tile, LookAtMode.Select);
               }
            }}
         >
            <div className={classNames({ "m-icon": true })}>do_not_disturb_on</div>
            <Tippy
               content={
                  <div>
                     <div className="text-strong text-center">{t(L.DeficitResources)}</div>
                     {Array.from(deficit)
                        .sort(([a, amountA], [b, amountB]) => {
                           return getResourceAmount(b) / amountB - getResourceAmount(a) / amountA;
                        })
                        .map(([res, amount]) => {
                           const runOutIn = formatHMS((1000 * getResourceAmount(res)) / Math.abs(amount));
                           return (
                              <div className="row text-small" key={res}>
                                 <div className="f1">{Config.Resource[res].name()}</div>
                                 <div className="ml20">{formatNumber(amount)}</div>
                                 <div style={{ width: "70px", textAlign: "right" }}>{runOutIn}</div>
                              </div>
                           );
                        })}
                  </div>
               }
               placement="bottom"
            >
               <div style={{ width: "5rem" }}>
                  <FormatNumber value={deficit.size} />
               </div>
            </Tippy>
         </div>
         <div className="separator-vertical" />
      </>
   );
}
