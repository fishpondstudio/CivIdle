import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useState } from "react";
import { TableVirtuoso } from "react-virtuoso";
import { BuildingSpecial, type IBuildingDefinition } from "../../../shared/definitions/BuildingDefinitions";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import {
   IOCalculation,
   getElectrificationStatus,
   getScienceFromBuildings,
   getScienceFromWorkers,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { EXPLORER_SECONDS, MAX_EXPLORER } from "../../../shared/logic/Constants";
import { ValueToTrack, getTimeSeriesHour } from "../../../shared/logic/GameState";
import {
   getBuildingIO,
   getFuelByTarget,
   getResourceIO,
   getTransportStat,
   getXyBuildings,
   unlockedResources,
} from "../../../shared/logic/IntraTickCache";
import { getScienceAmount } from "../../../shared/logic/TechLogic";
import { NotProducingReason, Tick } from "../../../shared/logic/TickLogic";
import type { IBuildingData } from "../../../shared/logic/Tile";
import {
   forEach,
   formatHMS,
   formatNumber,
   hasFlag,
   keysOf,
   mReduceOf,
   numberToRoman,
   type Tile,
} from "../../../shared/utilities/Helper";
import type { PartialSet } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { TimeSeries } from "../logic/TimeSeries";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingFilter, Filter } from "./FilterComponent";
import { FormatNumber } from "./HelperComponents";
import { PlotComponent } from "./PlotComponent";
import { TableView } from "./TableView";
import { WorkerScienceComponent } from "./WorkerScienceComponent";

type Tab = "resources" | "buildings" | "empire";
let savedStatisticsTab: Tab = "empire";

export function StatisticsBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IBuildingData;
   if (building == null) {
      return null;
   }
   const [currentTab, setCurrentTab] = useState<Tab>(savedStatisticsTab);
   let content: React.ReactNode = null;
   let extraClass = "";
   if (currentTab === "resources") {
      extraClass = "col f1";
      savedStatisticsTab = "resources";
      content = <ResourcesTab gameState={gameState} xy={xy} />;
   } else if (currentTab === "buildings") {
      extraClass = "col f1";
      savedStatisticsTab = "buildings";
      content = <BuildingTab gameState={gameState} xy={xy} />;
   } else if (currentTab === "empire") {
      savedStatisticsTab = "empire";
      content = <EmpireTab gameState={gameState} xy={xy} />;
   }
   return (
      <div className={`window-body ${extraClass}`}>
         <menu role="tablist">
            <button onClick={() => setCurrentTab("empire")} aria-selected={currentTab === "empire"}>
               {t(L.StatisticsEmpire)}
            </button>
            <button onClick={() => setCurrentTab("resources")} aria-selected={currentTab === "resources"}>
               {t(L.StatisticsResources)}
            </button>
            <button onClick={() => setCurrentTab("buildings")} aria-selected={currentTab === "buildings"}>
               {t(L.StatisticsBuildings)}
            </button>
         </menu>
         {content}
         {currentTab === "empire" ? <BuildingColorComponent gameState={gameState} xy={xy} /> : null}
      </div>
   );
}

function EmpireTab({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   // Get total resource value
   const totalResourceValue = mReduceOf(Tick.current.resourceValues, (prev, res, value) => prev + value, 0);

   // Get buildings value
   const totalBuildingValue = mReduceOf(Tick.current.buildingValues, (prev, res, value) => prev + value, 0);

   // Get science from buildings
   const totalBuildingScience = getScienceFromBuildings();
   const { scienceFromWorkers } = getScienceFromWorkers(gameState);
   const scienceAmount = getScienceAmount(gameState);
   const sciencePerTick = scienceFromWorkers + totalBuildingScience;
   const transportStat = getTransportStat(gameState);
   return (
      <article role="tabpanel" className="f1 col" style={{ padding: "8px", overflow: "hidden" }}>
         <fieldset>
            <legend>{t(L.TotalEmpireValue)}</legend>
            <ul className="tree-view">
               <li className="row">
                  <div className="f1">{t(L.TotalEmpireValue)}</div>
                  <div className="text-strong">
                     <FormatNumber value={Tick.current.totalValue} />
                  </div>
               </li>
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.EmpireValueFromResourcesStat)}</div>
                        <div className="text-strong">
                           <FormatNumber value={totalResourceValue} />
                        </div>
                     </summary>
                     <ul className="text-small">
                        {Array.from(Tick.current.resourceValues.keys())
                           .sort(
                              (a, b) =>
                                 (Tick.current.resourceValues.get(b) ?? 0) -
                                 (Tick.current.resourceValues.get(a) ?? 0),
                           )
                           .map((res) => {
                              const force =
                                 res === "Science" && Tick.current.specialBuildings.has("MatrioshkaBrain");
                              if (!force && (NoPrice[res] || NoStorage[res])) {
                                 return null;
                              }
                              return (
                                 <li key={res} className="row">
                                    <div className="f1">{Config.Resource[res].name()}</div>
                                    <FormatNumber value={Tick.current.resourceValues.get(res)} />
                                 </li>
                              );
                           })}
                     </ul>
                  </details>
               </li>
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.EmpireValueFromBuildingsStat)}</div>
                        <div className="text-strong">
                           <FormatNumber value={totalBuildingValue} />
                        </div>
                     </summary>
                     <ul className="text-small">
                        {Array.from(Tick.current.buildingValues.keys())
                           .sort(
                              (a, b) =>
                                 (Tick.current.buildingValues.get(b) ?? 0) -
                                 (Tick.current.buildingValues.get(a) ?? 0),
                           )
                           .map((b) => {
                              return (
                                 <li key={b} className="row">
                                    <div className="f1">{Config.Building[b].name()}</div>
                                    <FormatNumber value={Tick.current.buildingValues.get(b)} />
                                 </li>
                              );
                           })}
                     </ul>
                  </details>
               </li>
            </ul>
            <div className="sep10" />
            <PlotComponent
               title={t(L.EmpireValueIncrease)}
               data={[TimeSeries.deltaTick, TimeSeries.empireValueDelta]}
               series={{ stroke: "#fdcb6e", fill: "#ffeaa7" }}
            />
            <div className="sep10" />
            <PlotComponent
               title={t(L.EmpireValueByHour)}
               data={[
                  getTimeSeriesHour(gameState),
                  gameState.valueTrackers.get(ValueToTrack.EmpireValue)?.history ?? [],
               ]}
               series={{ stroke: "#fdcb6e", fill: "#ffeaa7" }}
            />
         </fieldset>
         <fieldset>
            <legend>{t(L.Science)}</legend>
            <ul className="tree-view">
               <li className="row">
                  <div className="f1">{t(L.StatisticsScience)}</div>
                  <div className="text-strong">
                     <FormatNumber value={scienceAmount} />
                  </div>
               </li>
               <li className="row">
                  <div className="f1">{t(L.StatisticsScienceProduction)}</div>
                  <div className="text-strong">
                     <FormatNumber value={sciencePerTick} />
                  </div>
               </li>
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.StatisticsScienceFromWorkers)}</div>
                        <div className="text-strong">
                           <FormatNumber value={scienceFromWorkers} />
                        </div>
                     </summary>
                     <ul>
                        <WorkerScienceComponent gameState={gameState} xy={xy} />
                     </ul>
                  </details>
               </li>
               <li>
                  <details>
                     <summary className="row">
                        <div className="f1">{t(L.StatisticsScienceFromBuildings)}</div>
                        <div className="text-strong">
                           <FormatNumber value={totalBuildingScience} />
                        </div>
                     </summary>
                     <ul className="text-small">
                        {Array.from(Tick.current.scienceProduced.keys())
                           .sort(
                              (a, b) =>
                                 Tick.current.scienceProduced.get(b)! - Tick.current.scienceProduced.get(a)!,
                           )
                           .map((xy) => {
                              const tile = gameState.tiles.get(xy);
                              const building = tile?.building;
                              return (
                                 <li key={xy} className="row">
                                    <div className="f1">{Config.Building[building!.type].name()}</div>
                                    <FormatNumber value={Tick.current.scienceProduced.get(xy)} />
                                 </li>
                              );
                           })}
                     </ul>
                  </details>
               </li>
            </ul>
            <div className="sep10" />
            <PlotComponent
               title={t(L.StatisticsScienceProduction)}
               data={[TimeSeries.deltaTick, TimeSeries.scienceDelta]}
               series={{ stroke: "#0984e3", fill: "#74b9ff" }}
            />
         </fieldset>
         <fieldset>
            <legend>{t(L.StatisticsTransportation)}</legend>
            <ul className="tree-view">
               <li className="row">
                  <div className="f1">{t(L.StatisticsTotalTransportation)}</div>
                  <div className="text-strong">
                     <FormatNumber value={transportStat.totalTransports} />
                  </div>
               </li>
               <li className="row">
                  <div className="f1">{t(L.StatisticsStalledTransportation)}</div>
                  <div className="text-strong">
                     <FormatNumber value={transportStat.stalled} />
                  </div>
               </li>
            </ul>
         </fieldset>
         <fieldset>
            <legend>{t(L.StatisticsExploration)}</legend>
            <ul className="tree-view">
               <details>
                  <summary className="row">
                     <div className="f1">{t(L.Explorer)}</div>
                     <div className="text-strong">
                        <FormatNumber value={building.resources.Explorer ?? 0} />
                     </div>
                  </summary>
                  <ul>
                     <li className="row text-small">
                        <div className="f1">{t(L.NextExplorersIn)}</div>
                        {(building.resources.Explorer ?? 0) >= 10 ? (
                           <div>-</div>
                        ) : (
                           <div>{EXPLORER_SECONDS - (gameState.tick % EXPLORER_SECONDS)}s</div>
                        )}
                     </li>
                     <li className="row text-small">
                        <div className="f1">{t(L.MaxExplorers)}</div>
                        <div>
                           <FormatNumber value={MAX_EXPLORER} />
                        </div>
                     </li>
                  </ul>
               </details>
            </ul>
         </fieldset>
      </article>
   );
}

let savedBuildingFilter = BuildingFilter.None;

function BuildingTab({ gameState }: IBuildingComponentProps): React.ReactNode {
   const [buildingFilter, _setBuildingFilter] = useState<BuildingFilter>(savedBuildingFilter);
   const setBuildingFilter = (newFilter: BuildingFilter) => {
      _setBuildingFilter(newFilter);
      savedBuildingFilter = newFilter;
   };
   const [search, setSearch] = useState<string>("");
   return (
      <article role="tabpanel" className="col" style={{ margin: 0, padding: 8, flex: 1 }}>
         <div className="row mb5">
            <input
               type="text"
               style={{ flex: 1 }}
               className="mr5"
               placeholder={t(L.StatisticsBuildingsSearchText)}
               onChange={(e) => setSearch(e.target.value)}
            />
            <Filter
               filter={buildingFilter}
               current={BuildingFilter.Wonder}
               savedFilter={savedBuildingFilter}
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
                     savedFilter={savedBuildingFilter}
                     onFilterChange={setBuildingFilter}
                  >
                     {numberToRoman(tier)}
                  </Filter>
               );
            })}
         </div>
         <div className="table-view" style={{ flex: 1 }}>
            <TableVirtuoso
               data={Array.from(getXyBuildings(gameState))
                  .filter(([_, b]) => {
                     // We should not show natural wonders in Stat Office. World wonder is fine
                     if (Config.Building[b.type].special === BuildingSpecial.NaturalWonder) {
                        return false;
                     }
                     let filter = (buildingFilter & 0x0fffffff) === 0;
                     for (let i = 0; i < 12; i++) {
                        if (hasFlag(buildingFilter, 1 << i)) {
                           filter ||= Config.BuildingTier[b.type] === i;
                        }
                     }
                     const s = search.toLowerCase();
                     return filter && Config.Building[b.type].name().toLowerCase().includes(s);
                  })
                  .sort(([_a, a], [_b, b]) =>
                     Config.Building[a.type].name().localeCompare(Config.Building[b.type].name()),
                  )}
               fixedHeaderContent={() => {
                  return (
                     <tr>
                        <th></th>
                        <th></th>
                        <th className="right">
                           <Tippy content={t(L.BuildingEmpireValue)}>
                              <div className="m-icon small">account_balance</div>
                           </Tippy>
                        </th>
                        <th className="right">
                           <Tippy content={t(L.TransportationWorkers)}>
                              <div className="m-icon small">local_shipping</div>
                           </Tippy>
                        </th>
                        <th className="right">
                           <Tippy content={t(L.ProductionWorkers)}>
                              <div className="m-icon small">settings</div>
                           </Tippy>
                        </th>
                     </tr>
                  );
               }}
               itemContent={(index, [xy, building]) => {
                  let icon = <div className="m-icon small text-green">check_circle</div>;
                  const notProducingReason = Tick.current.notProducingReasons.get(xy);
                  if (building.status !== "completed") {
                     icon = <div className="m-icon small text-orange">build_circle</div>;
                  } else if (notProducingReason) {
                     if (notProducingReason === NotProducingReason.StorageFull) {
                        icon = <div className="m-icon small text-red">stroke_full</div>;
                     } else {
                        icon = <div className="m-icon small text-red">error</div>;
                     }
                  }
                  return (
                     <>
                        <td>
                           {icon}
                           {getElectrificationStatus(xy, gameState) === "Active" ? (
                              <div className="m-icon small text-orange">bolt</div>
                           ) : null}
                        </td>
                        <td>
                           <div
                              className="pointer"
                              onClick={() => {
                                 Singleton()
                                    .sceneManager.getCurrent(WorldScene)
                                    ?.lookAtTile(xy, LookAtMode.Highlight);
                              }}
                           >
                              {Config.Building[building.type].name()}
                           </div>
                           <div className="text-small text-desc">
                              {t(L.LevelX, { level: building.level })}
                           </div>
                        </td>
                        <td className="text-small right">
                           <div>
                              <FormatNumber value={Tick.current.buildingValueByTile.get(xy) ?? 0} />
                           </div>
                           <div>
                              <FormatNumber value={Tick.current.resourceValueByTile.get(xy) ?? 0} />
                           </div>
                        </td>
                        <td className="right">
                           <FormatNumber value={getFuelByTarget().get(xy) ?? 0} />
                        </td>
                        <td
                           className={classNames({
                              "text-red":
                                 Tick.current.notProducingReasons.get(xy) ===
                                 NotProducingReason.NotEnoughWorkers,
                              "text-right": true,
                           })}
                        >
                           <FormatNumber value={Tick.current.workersAssignment.get(xy) ?? 0} />
                        </td>
                     </>
                  );
               }}
            />
         </div>
      </article>
   );
}

const resourceTabSortingState = { column: 0, asc: true };
let savedResourceTierFilter = BuildingFilter.None;

function ResourcesTab({ gameState }: IBuildingComponentProps): React.ReactNode {
   const [resourceTierFilter, _setResourceTierFilter] = useState<BuildingFilter>(savedResourceTierFilter);
   const setResourceTierFilter = (newFilter: BuildingFilter) => {
      _setResourceTierFilter(newFilter);
      savedResourceTierFilter = newFilter;
   };
   const [search, setSearch] = useState<string>("");
   const [showTheoreticalValue, setShowTheoreticalValue] = useState(true);
   const unlockedResourcesList: PartialSet<Resource> = unlockedResources(gameState);
   const io = getResourceIO(gameState);
   const inputs = showTheoreticalValue ? io.theoreticalInput : io.actualInput;
   const outputs = showTheoreticalValue ? io.theoreticalOutput : io.actualOutput;

   const highlightResourcesUsed = (
      res: Resource,
      type: keyof Pick<IBuildingDefinition, "input" | "output">,
   ) => {
      const inputOutputTiles: Tile[] = [];

      gameState.tiles.forEach((tile, xy) => {
         const inputOutput = getBuildingIO(
            xy,
            type,
            IOCalculation.Multiplier | IOCalculation.Capacity,
            gameState,
         );
         forEach(inputOutput, (r, amount) => {
            if (res === r) {
               inputOutputTiles.push(tile.tile);
            }
         });
      });
      Singleton().sceneManager.getCurrent(WorldScene)?.drawSelection(null, inputOutputTiles);
   };

   return (
      <article role="tabpanel" className="f1 col" style={{ margin: 0, padding: 8, overflow: "auto" }}>
         <div className="row mb5">
            <input
               type="text"
               style={{ flex: 1 }}
               className="mr5"
               placeholder={t(L.StatisticsResourcesSearchText)}
               onChange={(e) => setSearch(e.target.value)}
            />
            {[1, 2, 3, 4, 5, 6, 7, 8].map((tier) => {
               return (
                  <Filter
                     key={tier}
                     filter={resourceTierFilter}
                     current={1 << tier}
                     savedFilter={savedResourceTierFilter}
                     onFilterChange={setResourceTierFilter}
                  >
                     {numberToRoman(tier)}
                  </Filter>
               );
            })}
            <Tippy content={showTheoreticalValue ? t(L.TheoreticalData) : t(L.LiveData)}>
               <button
                  className={classNames({
                     active: !showTheoreticalValue,
                  })}
                  style={{ width: 27, padding: 0 }}
                  onClick={() => {
                     setShowTheoreticalValue(!showTheoreticalValue);
                  }}
               >
                  <div className="m-icon small">live_tv</div>
               </button>
            </Tippy>
         </div>
         <TableView
            classNames="sticky-header f1"
            header={[
               { name: "", sortable: true },
               { name: t(L.ResourceAmount), right: true, sortable: true },
               { name: t(L.StatisticsResourcesDeficit), right: true, sortable: true },
               { name: t(L.StatisticsResourcesRunOut), right: true, sortable: true },
            ]}
            sortingState={resourceTabSortingState}
            data={keysOf(unlockedResourcesList).filter((v) => {
               let filter = (savedResourceTierFilter & 0x0fffffff) === 0;
               for (let i = 0; i < 12; i++) {
                  if (hasFlag(savedResourceTierFilter, 1 << i)) {
                     filter ||= Config.ResourceTier[v] === i;
                  }
               }

               const s = search.toLowerCase();
               return filter && Config.Resource[v].name().toLowerCase().includes(s);
            })}
            compareFunc={(a, b, i) => {
               switch (i) {
                  case 1:
                     return (
                        (Tick.current.resourceAmount.get(a) ?? 0) - (Tick.current.resourceAmount.get(b) ?? 0)
                     );
                  case 2:
                     return (
                        (outputs.get(a) ?? 0) -
                        (inputs.get(a) ?? 0) -
                        ((outputs.get(b) ?? 0) - (inputs.get(b) ?? 0))
                     );
                  case 3: {
                     const deficitA = (outputs.get(a) ?? 0) - (inputs.get(a) ?? 0);
                     const deficitB = (outputs.get(b) ?? 0) - (inputs.get(b) ?? 0);
                     const timeLeftA =
                        deficitA < 0
                           ? (Tick.current.resourceAmount.get(a) ?? 0) / deficitA
                           : Number.NEGATIVE_INFINITY;
                     const timeLeftB =
                        deficitB < 0
                           ? (Tick.current.resourceAmount.get(b) ?? 0) / deficitB
                           : Number.NEGATIVE_INFINITY;
                     return timeLeftA !== timeLeftB
                        ? timeLeftB - timeLeftA
                        : Config.Resource[a].name().localeCompare(Config.Resource[b].name());
                  }
                  default: {
                     return Config.Resource[a].name().localeCompare(Config.Resource[b].name());
                  }
               }
            }}
            renderRow={(res) => {
               const r = Config.Resource[res];
               if (NoPrice[res] || NoStorage[res]) {
                  return null;
               }
               const output = outputs.get(res) ?? 0;
               const input = inputs.get(res) ?? 0;
               const deficit = output - input;
               const amount = Tick.current.resourceAmount.get(res) ?? 0;
               const timeLeft =
                  deficit < 0 ? Math.abs((1000 * amount ?? 0) / deficit) : Number.POSITIVE_INFINITY;

               return (
                  <tr key={res}>
                     <td>
                        <div>{r.name()}</div>
                        <Tippy content={t(L.EmpireValue)}>
                           <span className="text-desc text-small">
                              <FormatNumber value={Config.ResourcePrice[res]} />
                           </span>
                        </Tippy>
                     </td>
                     <td className="right">
                        <FormatNumber value={amount} />
                     </td>
                     <td>
                        <div className={classNames({ "text-right": true, "text-red": deficit < 0 })}>
                           <FormatNumber value={deficit} />
                        </div>
                        <Tippy
                           content={t(L.StatisticsResourcesDeficitDesc, {
                              output: formatNumber(output),
                              input: formatNumber(input),
                           })}
                        >
                           <div className="text-small text-right text-desc">
                              <span className="pointer" onClick={() => highlightResourcesUsed(res, "output")}>
                                 <FormatNumber value={output} />
                              </span>{" "}
                              -{" "}
                              <span className="pointer" onClick={() => highlightResourcesUsed(res, "input")}>
                                 <FormatNumber value={input} />
                              </span>
                           </div>
                        </Tippy>
                     </td>
                     <td className={classNames({ "text-red": deficit < 0, "text-right text-small": true })}>
                        {formatHMS(timeLeft)}
                     </td>
                  </tr>
               );
            }}
         />
      </article>
   );
}
