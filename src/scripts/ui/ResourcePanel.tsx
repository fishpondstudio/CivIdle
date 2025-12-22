import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import {
   getMaxWarpSpeed,
   getScienceFromWorkers,
   isSpecialBuilding,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { FESTIVAL_CONVERSION_RATE } from "../../../shared/logic/Constants";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { GameStateChanged, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getHappinessIcon } from "../../../shared/logic/HappinessLogic";
import { getResourceIO } from "../../../shared/logic/IntraTickCache";
import {
   getProgressTowardsNextGreatPerson,
   getRebirthGreatPeopleCount,
   getValueRequiredForGreatPeople,
} from "../../../shared/logic/RebirthLogic";
import { getResourceAmount } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import {
   Rounding,
   clamp,
   formatHMS,
   formatNumber,
   formatPercent,
   mathSign,
   range,
   round,
   tileToPoint,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { FloatingModeChanged, useFloatingMode, useGameOptions, useGameState } from "../Global";
import { useCurrentTick } from "../logic/ClientUpdate";
import { TimeSeries } from "../logic/TimeSeries";
import { getTradeCount } from "../rpc/RPCClient";
import { SteamClient, isSteam } from "../rpc/SteamClient";
import { EmptyScene } from "../scenes/EmptyScene";
import { getOwnedTradeTile } from "../scenes/PathFinder";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { useTypedEvent } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playClick, playError } from "../visuals/Sound";
import { showModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { LoadingPage, LoadingPageStage } from "./LoadingPage";
import { PlayerTradeModal } from "./PlayerTradeModal";
import { TilePage } from "./TilePage";

export function ResourcePanel(): React.ReactNode {
   const tick = useCurrentTick();
   const gs = useGameState();
   const options = useGameOptions();
   const isFloating = useFloatingMode();
   const ref = useRef<HTMLDivElement>(null);
   const { workersAfterHappiness, workersBusy } = getScienceFromWorkers(gs);
   const currentWarp = Tick.current.specialBuildings.get("Headquarter")?.building.resources.Warp ?? 0;

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

   let timeToNextGreatPerson = 0;
   if (evDelta > 0) {
      timeToNextGreatPerson =
         (getValueRequiredForGreatPeople(getRebirthGreatPeopleCount() + 1) - Tick.current.totalValue) /
         evDelta;
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

   const updateWindowSize = () => {
      if (!isFloating) {
         return;
      }
      if (!ref.current) {
         return;
      }
      const rect = ref.current.getBoundingClientRect();
      SteamClient.setSize(Math.round(rect.width), Math.round(rect.height + 50));
   };

   useTypedEvent(GameStateChanged, updateWindowSize);

   return (
      <div
         id="resource-panel"
         className={classNames({ window: true, "app-region-drag": isFloating, "is-floating": isFloating })}
         ref={ref}
      >
         {isSteam() ? (
            <>
               <Tippy content={t(L.EnterExitMinimizedMode)}>
                  <div className="menu-button app-region-none">
                     <div
                        className="m-icon"
                        onClick={async () => {
                           if (isFloating) {
                              FloatingModeChanged.emit(false);
                              await SteamClient.exitFloatingMode();
                              await SteamClient.maximize();
                              Singleton().routeTo(LoadingPage, { stage: LoadingPageStage.SteamSignIn });
                              setTimeout(() => {
                                 Singleton().sceneManager.loadScene(WorldScene);
                              }, 1000);
                           } else {
                              FloatingModeChanged.emit(true);
                              Singleton().sceneManager.loadScene(EmptyScene);
                              await SteamClient.enterFloatingMode();
                              await SteamClient.restore();
                              if (ref.current) {
                                 const rect = ref.current.getBoundingClientRect();
                                 await SteamClient.setSize(
                                    Math.round(rect.width),
                                    Math.round(rect.height + 50),
                                 );
                              }
                           }
                        }}
                     >
                        {isFloating ? "pip_exit" : "picture_in_picture"}
                     </div>
                  </div>
               </Tippy>
               <div className="separator-vertical" />
            </>
         ) : null}
         {!isFloating && (
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
         )}
         {!options.hideResourcePanelSections.has("Happiness") && tick.happiness ? (
            <>
               <div className="separator-vertical" />
               <div
                  id="tutorial-happiness"
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
                     content={
                        options.resourceBarShowUncappedHappiness ? t(L.HappinessUncapped) : t(L.Happiness)
                     }
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
            </>
         ) : null}
         {!options.hideResourcePanelSections.has("Festival") && (
            <>
               <div className="separator-vertical" />
               <Tippy disabled={isFloating} content={Config.City[gs.city].festivalDesc()}>
                  <div
                     className={classNames({
                        section: true,
                        pointer: true,
                        "app-region-none": true,
                        "text-orange": gs.festival,
                     })}
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
                              (Tick.current.specialBuildings.get("Headquarter")?.building.resources
                                 .Festival ?? 0) / FESTIVAL_CONVERSION_RATE,
                           )}
                        />
                     </div>
                  </div>
               </Tippy>
            </>
         )}
         {!options.hideResourcePanelSections.has("Workers") && (
            <>
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
            </>
         )}
         {!options.hideResourcePanelSections.has("Electricity") &&
            hasFeature(GameFeature.Electricity, gs) && (
               <>
                  <div className="separator-vertical" />
                  <div className="section">
                     <div
                        className={classNames({
                           "m-icon": true,
                           "text-red":
                              (tick.workersAvailable.get("Power") ?? 0) <
                              (tick.workersUsed.get("Power") ?? 0),
                           "text-green":
                              (tick.workersAvailable.get("Power") ?? 0) >
                              (tick.workersUsed.get("Power") ?? 0),
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
               </>
            )}
         {!options.hideResourcePanelSections.has("Science") && (
            <>
               <div className="separator-vertical" />
               <div
                  className="section pointer"
                  onClick={() => Singleton().sceneManager.loadScene(TechTreeScene)}
               >
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
            </>
         )}
         {!options.hideResourcePanelSections.has("Deficit") && (
            <>
               <div className="separator-vertical" />
               <DeficitResources />
            </>
         )}
         {!options.hideResourcePanelSections.has("EmpireValue") && (
            <>
               <div className="separator-vertical" />
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
            </>
         )}
         {!options.hideResourcePanelSections.has("GreatPeople") && (
            <>
               <div className="separator-vertical" />
               <div className="section">
                  <div className="m-icon small">person_celebrate</div>
                  <Tippy
                     maxWidth="50vw"
                     content={
                        <>
                           <div>
                              {t(L.ExtraGreatPeopleAtReborn)}: {getRebirthGreatPeopleCount()}
                           </div>
                           <div>
                              {t(L.ProgressTowardsNextGreatPerson)}:{" "}
                              {formatPercent(
                                 clamp(getProgressTowardsNextGreatPerson(), 0, 1),
                                 0,
                                 Rounding.Floor,
                              )}{" "}
                              ({formatHMS(timeToNextGreatPerson * 1000)})
                           </div>
                        </>
                     }
                  >
                     <div style={{ width: "8rem" }}>
                        <span>{getRebirthGreatPeopleCount()}</span>
                        <span className="text-desc" style={{ fontWeight: "normal", marginLeft: 5 }}>
                           (
                           {formatPercent(
                              clamp(getProgressTowardsNextGreatPerson(), 0, 1),
                              0,
                              Rounding.Floor,
                           )}
                           )
                        </span>
                     </div>
                  </Tippy>
               </div>
            </>
         )}
         {!options.hideResourcePanelSections.has("PlayerTrade") &&
         getOwnedTradeTile() &&
         Tick.current.playerTradeBuildings.size > 0 ? (
            <>
               <div className="separator-vertical" />
               <Tippy content={t(L.PlayerTrade)}>
                  <div
                     className="section pointer mh10"
                     onPointerDown={(e) => {
                        playClick();
                        showModal(<PlayerTradeModal />);
                     }}
                  >
                     <div className="m-icon small">currency_exchange</div>
                     <div>
                        <span>{formatNumber(getTradeCount())}</span>
                     </div>
                  </div>
               </Tippy>
            </>
         ) : null}
         {!options.hideResourcePanelSections.has("TimeWarp") && (
            <>
               <div className="separator-vertical" />
               <Tippy
                  content={
                     <>
                        <div className="row g20">
                           <div className="f1">{t(L.WarpSpeed)}</div>
                           <div>{gs.speedUp}x</div>
                        </div>
                        {gs.speedUp > 1 ? (
                           <div className="row g20">
                              <div className="f1">{t(L.EstimatedTimeLeft)}</div>
                              <div>{formatHMS((1000 * currentWarp) / (gs.speedUp - 1))}</div>
                           </div>
                        ) : null}
                     </>
                  }
               >
                  <div className="section app-region-none" style={{ padding: "0 0.5rem" }}>
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
               </Tippy>
            </>
         )}
      </div>
   );
}

function DeficitResources(): React.ReactNode {
   const gs = useGameState();
   const deficit = new Map<Material, number>();
   const { theoreticalInput, theoreticalOutput } = getResourceIO(gs);
   theoreticalInput.forEach((input, res) => {
      const diff = (theoreticalOutput.get(res) ?? 0) - input;
      if (diff < 0) {
         deficit.set(res, diff);
      }
   });
   return (
      <Tippy
         maxWidth="50vw"
         content={
            <>
               <div>{t(L.DeficitResources)}</div>
               <table className="date-table" style={{ minWidth: 250 }}>
                  <thead>
                     <tr>
                        <th className="text-left">{t(L.Resource)}</th>
                        <th className="text-right">{t(L.StatisticsResourcesDeficit)}</th>
                        <th className="text-right">{t(L.StatisticsResourcesRunOut)}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {Array.from(deficit)
                        .sort(([a, amountA], [b, amountB]) => {
                           return getResourceAmount(b) / amountB - getResourceAmount(a) / amountA;
                        })
                        .map(([res, amount]) => {
                           const runOutIn = formatHMS((1000 * getResourceAmount(res)) / Math.abs(amount));
                           return (
                              <tr key={res}>
                                 <td>{Config.Material[res].name()}</td>
                                 <td className="text-right">{formatNumber(amount)}</td>
                                 <td className="text-right">{runOutIn}</td>
                              </tr>
                           );
                        })}
                  </tbody>
               </table>
            </>
         }
      >
         <div
            className="section pointer mh10"
            onPointerDown={(e) => {
               playClick();
               const s = Tick.current.specialBuildings.get("Statistics");
               if (s) {
                  Singleton()
                     .sceneManager.getCurrent(WorldScene)
                     ?.selectGrid(tileToPoint(s.tile), { tab: "resources" });
               }
            }}
         >
            <div className="m-icon small">do_not_disturb_on</div>
            <div>{formatNumber(deficit.size)}</div>
         </div>
      </Tippy>
   );
}
