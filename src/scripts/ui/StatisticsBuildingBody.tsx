import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useState } from "react";
import type { Building, IBuildingDefinition } from "../../../shared/definitions/BuildingDefinitions";
import {
   NoPrice,
   NoStorage,
   type Resource,
   type ResourceDefinitions,
} from "../../../shared/definitions/ResourceDefinitions";
import {
   IOCalculation,
   getBuildingValue,
   getElectrificationStatus,
   getScienceFromBuildings,
   getScienceFromWorkers,
   isHeadquarters,
   isNaturalWonder,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { getBuildingIO, getTypeBuildings, unlockedResources } from "../../../shared/logic/IntraTickCache";
import { getCurrentTechAge, getScienceAmount } from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import type { IBuildingData } from "../../../shared/logic/Tile";
import {
   forEach,
   formatHMS,
   formatNumber,
   formatPercent,
   keysOf,
   mReduceOf,
   reduceOf,
   safeAdd,
   type Tile,
} from "../../../shared/utilities/Helper";
import type { PartialSet, PartialTabulate } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { jsxMMapOf } from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";
import { TableView } from "./TableView";
import { WorkerScienceComponent } from "./WorkerScienceComponent";

type Tab = "resources" | "buildings" | "transportation" | "empire";

export function StatisticsBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IBuildingData;
   if (building == null) {
      return null;
   }
   const [currentTab, setCurrentTab] = useState<Tab>("empire");
   let content: React.ReactNode = null;
   if (currentTab === "resources") {
      content = <ResourcesTab gameState={gameState} xy={xy} />;
   } else if (currentTab === "buildings") {
      content = <BuildingTab gameState={gameState} xy={xy} />;
   } else if (currentTab === "transportation") {
      content = <TransportationTab gameState={gameState} xy={xy} />;
   } else if (currentTab === "empire") {
      content = <EmpireTab gameState={gameState} xy={xy} />;
   }
   return (
      <div className="window-body column">
         <menu role="tablist">
            <button
               onClick={() => setCurrentTab("empire")}
               aria-selected={currentTab === "empire" ? true : false}
            >
               Empire
            </button>
            <button
               onClick={() => setCurrentTab("resources")}
               aria-selected={currentTab === "resources" ? true : false}
            >
               {t(L.StatisticsResources)}
            </button>
            <button
               onClick={() => setCurrentTab("buildings")}
               aria-selected={currentTab === "buildings" ? true : false}
            >
               {t(L.StatisticsBuildings)}
            </button>
            <button
               onClick={() => setCurrentTab("transportation")}
               aria-selected={currentTab === "transportation" ? true : false}
            >
               {t(L.StatisticsTransportation)}
            </button>
         </menu>
         {content}
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}

function EmpireTab({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
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

   // Get total resource value
   const totalResourceValue = reduceOf(
      resourceAmounts,
      (prev, res, value) =>
         prev + (!NoPrice[res] && !NoStorage[res] ? value * Config.ResourcePrice[res]! : 0),
      0,
   );

   // Get buildings value
   let totalBuildingValue = 0;
   const buildingTypeValues: Partial<Record<Building, number>> = {};
   getTypeBuildings(gameState).forEach((buildings, v) => {
      if (isNaturalWonder(v) || isHeadquarters(v)) {
         return;
      }
      const buildingTypeValue = mReduceOf(
         buildings,
         (prev, i, value) => {
            const buildingValue = getBuildingValue(value.building);
            return prev + buildingValue;
         },
         0,
      );
      buildingTypeValues[v] = buildingTypeValue;
      totalBuildingValue += buildingTypeValue;
   });

   // Get science from buildings
   const totalBuildingScience = getScienceFromBuildings();
   const { scienceFromWorkers } = getScienceFromWorkers(gameState);
   const scienceAmount = getScienceAmount();
   const sciencePerTick = scienceFromWorkers + totalBuildingScience;
   const techAge = getCurrentTechAge(gameState);
   return (
      <article role="tabpanel" className="f1 column" style={{ padding: "8px", overflow: "auto" }}>
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.TotalEmpireValue)}</div>
               <div className="text-strong">
                  <FormatNumber value={Tick.current.totalValue} />
               </div>
            </div>
         </fieldset>
         <fieldset>
            <legend>Resources</legend>
            <div className="sep5" />
            <ul className="tree-view">
               <details>
                  <summary className="row">
                     <div className="f1">{t(L.EmpireValueFromResources)}</div>
                     <div className="text-strong">
                        <FormatNumber value={totalResourceValue} />
                     </div>
                  </summary>
                  <ul className="text-small">
                     {keysOf(resourceAmounts)
                        .sort(
                           (a, b) =>
                              resourceAmounts[b]! * Config.ResourcePrice[b]! -
                              resourceAmounts[a]! * Config.ResourcePrice[a]!,
                        )
                        .map((res) => {
                           if (NoPrice[res] || NoStorage[res]) {
                              return null;
                           }
                           return (
                              <li key={res} className="row">
                                 <div className="f1">{Config.Resource[res].name()}</div>
                                 <FormatNumber value={resourceAmounts[res]! * Config.ResourcePrice[res]!} />
                              </li>
                           );
                        })}
                  </ul>
               </details>
            </ul>
         </fieldset>

         <fieldset>
            <legend>Buildings</legend>
            <div className="sep5" />
            <ul className="tree-view">
               <details>
                  <summary className="row">
                     <div className="f1">{t(L.EmpireValueFromBuildings)}</div>
                     <div className="text-strong">
                        <FormatNumber value={totalBuildingValue} />
                     </div>
                  </summary>
                  <ul className="text-small">
                     {keysOf(buildingTypeValues)
                        .sort((a, b) => buildingTypeValues[b]! - buildingTypeValues[a]!)
                        .map((b) => {
                           return (
                              <li key={b} className="row">
                                 <div className="f1">{Config.Building[b].name()}</div>
                                 <FormatNumber value={buildingTypeValues[b]!} />
                              </li>
                           );
                        })}
                  </ul>
               </details>
            </ul>
         </fieldset>

         <fieldset>
            <legend>{techAge != null ? Config.TechAge[techAge].name() : "Unknown Age"}</legend>
            <div className="row">
               <div className="f1">{t(L.StatisticsScience)}</div>
               <div className="text-strong">
                  <FormatNumber value={scienceAmount} />
               </div>
            </div>
            <div className="sep5" />
            <ul className="tree-view">
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
                     {hasFeature(GameFeature.Electricity, gameState) ? <th></th> : null}
                     <th></th>
                     <th className="right">{t(L.Level)}</th>
                     <th className="right">
                        <div className="m-icon small">local_shipping</div>
                     </th>
                     <th className="right">
                        <div className="m-icon small">settings</div>
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
                           if (notProducingReason === "StorageFull") {
                              icon = <div className="m-icon small text-red">stroke_full</div>;
                           } else {
                              icon = <div className="m-icon small text-red">error</div>;
                           }
                        }
                        return (
                           <tr key={xy}>
                              <td>{icon}</td>
                              {hasFeature(GameFeature.Electricity, gameState) ? (
                                 <td>
                                    {getElectrificationStatus(xy, gameState) === "Active" ? (
                                       <div className="m-icon small text-orange">bolt</div>
                                    ) : null}
                                 </td>
                              ) : null}
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
                              </td>
                              <td className="right">
                                 <FormatNumber value={building.level} />
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
                                       Tick.current.notProducingReasons.get(xy) === "NotEnoughWorkers",
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

function TransportationTab({ gameState }: IBuildingComponentProps): React.ReactNode {
   return (
      <article role="tabpanel" className="f1 column" style={{ padding: "8px", overflowY: "auto" }}>
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.StatisticsTransportationPercentage)}</div>
               <div className="text-strong">
                  {formatPercent(
                     mReduceOf(
                        gameState.transportation,
                        (prev, k, v) => prev + v.reduce((prev, curr) => prev + curr.currentFuelAmount, 0),
                        0,
                     ) / Tick.current.workersUsed.get("Worker")!,
                  )}
               </div>
            </div>
         </fieldset>
         <div className="table-view sticky-header f1">
            <table>
               <thead>
                  <tr>
                     <th></th>
                     <th>{t(L.StatisticsTransportationBuilding)}</th>
                     <th>{t(L.StatisticsTransportationResource)}</th>
                     <th className="right">{t(L.StatisticsTransportationAmount)}</th>
                     <th className="right">
                        <div className="m-icon small">group</div>
                     </th>
                     <th className="right">
                        <div className="m-icon small">hourglass_empty</div>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {jsxMMapOf(gameState.transportation, (xy, transportations) => {
                     return transportations.map((transportation, i) => {
                        const buildingType = gameState.tiles.get(xy)?.building?.type;
                        return (
                           <tr key={transportation.id}>
                              <td>
                                 {transportation.hasEnoughFuel ? (
                                    <div className="m-icon text-green small">check_circle</div>
                                 ) : (
                                    <div className="m-icon text-red small">error</div>
                                 )}
                              </td>
                              <td className="text-strong">
                                 {i === 0 && buildingType ? Config.Building[buildingType].name() : null}
                              </td>
                              <td>{Config.Resource[transportation.resource].name()}</td>
                              <td className="text-right">
                                 <FormatNumber value={transportation.amount} />
                              </td>
                              <td className="text-right">
                                 <FormatNumber value={transportation.currentFuelAmount} />
                              </td>
                              <td className="text-right">
                                 <FormatNumber
                                    value={(100 * transportation.ticksSpent) / transportation.ticksRequired}
                                 />
                                 %
                              </td>
                           </tr>
                        );
                     });
                  })}
               </tbody>
            </table>
         </div>
      </article>
   );
}

function ResourcesTab({ gameState }: IBuildingComponentProps): React.ReactNode {
   const [showTheoreticalValue, setShowTheoreticalValue] = useState(true);
   const unlockedResourcesList: PartialSet<Resource> = unlockedResources(gameState);
   const resourceAmounts: Partial<Record<keyof ResourceDefinitions, number>> = {};
   const inputs: PartialTabulate<Resource> = {};
   const outputs: PartialTabulate<Resource> = {};
   gameState.tiles.forEach((tile, xy) => {
      const input = getBuildingIO(xy, "input", IOCalculation.Multiplier | IOCalculation.Capacity, gameState);
      const output = getBuildingIO(
         xy,
         "output",
         IOCalculation.Multiplier | IOCalculation.Capacity,
         gameState,
      );
      if (!showTheoreticalValue && Tick.current.notProducingReasons.has(xy)) {
         return;
      }
      forEach(input, (res, amount) => safeAdd(inputs, res, amount));
      forEach(output, (res, amount) => safeAdd(outputs, res, amount));
   });
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
            data={keysOf(unlockedResourcesList)}
            compareFunc={(a, b, i) => {
               switch (i) {
                  case 1:
                     return (resourceAmounts[a] ?? 0) - (resourceAmounts[b] ?? 0);
                  case 2:
                     return (outputs[a] ?? 0) - (inputs[a] ?? 0) - ((outputs[b] ?? 0) - (inputs[b] ?? 0));
                  case 3: {
                     const deficitA = (outputs[a] ?? 0) - (inputs[a] ?? 0);
                     const deficitB = (outputs[b] ?? 0) - (inputs[b] ?? 0);
                     const timeLeftA = deficitA < 0 ? (resourceAmounts[a] ?? 0) / deficitA : -Infinity;
                     const timeLeftB = deficitB < 0 ? (resourceAmounts[b] ?? 0) / deficitB : -Infinity;
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
               const output = outputs[res] ?? 0;
               const input = inputs[res] ?? 0;
               const deficit = output - input;
               const amount = resourceAmounts[res] ?? 0;
               const timeLeft = deficit < 0 ? Math.abs((1000 * amount ?? 0) / deficit) : Infinity;

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
