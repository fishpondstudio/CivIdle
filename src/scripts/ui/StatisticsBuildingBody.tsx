import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useState } from "react";
import type { IBuildingDefinition } from "../../../shared/definitions/BuildingDefinitions";
import {
   NoPrice,
   NoStorage,
   type Resource,
   type ResourceDefinitions,
} from "../../../shared/definitions/ResourceDefinitions";
import {
   IOCalculation,
   getElectrificationStatus,
   getScienceFromBuildings,
   getScienceFromWorkers,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { EXPLORER_SECONDS, MAX_EXPLORER } from "../../../shared/logic/Constants";
import {
   getBuildingIO,
   getResourceIO,
   getTransportStat,
   unlockedResources,
} from "../../../shared/logic/IntraTickCache";
import { getScienceAmount } from "../../../shared/logic/TechLogic";
import { NotProducingReason, Tick } from "../../../shared/logic/TickLogic";
import type { IBuildingData } from "../../../shared/logic/Tile";
import {
   forEach,
   formatHMS,
   formatNumber,
   keysOf,
   mReduceOf,
   type Tile,
} from "../../../shared/utilities/Helper";
import type { PartialSet } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";
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
   if (currentTab === "resources") {
      savedStatisticsTab = "resources";
      content = <ResourcesTab gameState={gameState} xy={xy} />;
   } else if (currentTab === "buildings") {
      savedStatisticsTab = "buildings";
      content = <BuildingTab gameState={gameState} xy={xy} />;
   } else if (currentTab === "empire") {
      savedStatisticsTab = "empire";
      content = <EmpireTab gameState={gameState} xy={xy} />;
   }
   return (
      <div className="window-body column">
         <menu role="tablist">
            <button onClick={() => setCurrentTab("empire")} aria-selected={currentTab === "empire"}>
               Empire
            </button>
            <button onClick={() => setCurrentTab("resources")} aria-selected={currentTab === "resources"}>
               {t(L.StatisticsResources)}
            </button>
            <button onClick={() => setCurrentTab("buildings")} aria-selected={currentTab === "buildings"}>
               {t(L.StatisticsBuildings)}
            </button>
         </menu>
         {content}
         <BuildingColorComponent gameState={gameState} xy={xy} />
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
      <article role="tabpanel" className="f1 column" style={{ padding: "8px", overflow: "auto" }}>
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
                              if (NoPrice[res] || NoStorage[res]) {
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

function BuildingTab({ gameState }: IBuildingComponentProps): React.ReactNode {
   return (
      <article role="tabpanel" className="f1" style={{ padding: "8px", overflow: "auto" }}>
         <div className="table-view sticky-header" style={{ height: "100%" }}>
            <table>
               <thead>
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
               </thead>
               <tbody>
                  {Array.from(gameState.tiles.entries())
                     .flatMap(([xy, tile]) => {
                        const building = tile.building;
                        return tile.explored && building ? [{ building, xy }] : [];
                     })
                     .sort((a, b) =>
                        Config.Building[a.building.type]
                           .name()
                           .localeCompare(Config.Building[b.building.type].name()),
                     )
                     .map(({ building, xy }) => {
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
                           <tr key={xy}>
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
                                 <FormatNumber
                                    value={
                                       gameState.transportation
                                          .get(xy)
                                          ?.reduce((prev, curr) => prev + curr.currentFuelAmount, 0) ?? 0
                                    }
                                 />
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
                           </tr>
                        );
                     })}
               </tbody>
            </table>
         </div>
      </article>
   );
}

const resourceTabSortingState = { column: 0, asc: true };

function ResourcesTab({ gameState }: IBuildingComponentProps): React.ReactNode {
   const [showTheoreticalValue, setShowTheoreticalValue] = useState(true);
   const unlockedResourcesList: PartialSet<Resource> = unlockedResources(gameState);
   const resourceAmounts: Partial<Record<keyof ResourceDefinitions, number>> = {};
   const io = getResourceIO(gameState);
   const inputs = showTheoreticalValue ? io.theoreticalInput : io.actualInput;
   const outputs = showTheoreticalValue ? io.theoreticalOutput : io.actualOutput;

   keysOf(unlockedResourcesList).map((res) => {
      resourceAmounts[res] =
         Tick.current.resourcesByTile
            .get(res)
            ?.reduce(
               (prev, curr) => prev + (gameState.tiles.get(curr.tile)?.building?.resources?.[res] ?? 0),
               0,
            ) ?? 0;
   });

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
      <article role="tabpanel" className="f1 column" style={{ padding: "8px", overflow: "auto" }}>
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.ShowTheoreticalValue)}</div>
               <div
                  className={classNames({
                     "text-green": showTheoreticalValue,
                     "text-grey": !showTheoreticalValue,
                  })}
               >
                  <div
                     onClick={() => {
                        playClick();
                        setShowTheoreticalValue(!showTheoreticalValue);
                     }}
                     style={{ margin: "-10px 0" }}
                     className="pointer m-icon"
                  >
                     {showTheoreticalValue ? "toggle_on" : "toggle_off"}
                  </div>
               </div>
            </div>
         </fieldset>
         <TableView
            classNames="sticky-header f1"
            header={[
               { name: "", sortable: true },
               { name: t(L.ResourceAmount), right: true, sortable: true },
               { name: t(L.StatisticsResourcesDeficit), right: true, sortable: true },
               { name: t(L.StatisticsResourcesRunOut), right: true, sortable: true },
            ]}
            sortingState={resourceTabSortingState}
            data={keysOf(unlockedResourcesList)}
            compareFunc={(a, b, i) => {
               switch (i) {
                  case 1:
                     return (resourceAmounts[a] ?? 0) - (resourceAmounts[b] ?? 0);
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
                        deficitA < 0 ? (resourceAmounts[a] ?? 0) / deficitA : Number.NEGATIVE_INFINITY;
                     const timeLeftB =
                        deficitB < 0 ? (resourceAmounts[b] ?? 0) / deficitB : Number.NEGATIVE_INFINITY;
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
               const amount = resourceAmounts[res] ?? 0;
               const timeLeft =
                  deficit < 0 ? Math.abs((1000 * amount ?? 0) / deficit) : Number.POSITIVE_INFINITY;

               return (
                  <tr key={res}>
                     <td>{r.name()}</td>
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
