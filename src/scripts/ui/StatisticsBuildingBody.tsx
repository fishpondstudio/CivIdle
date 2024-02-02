import classNames from "classnames";
import { useState } from "react";
import type { Resource, ResourceDefinitions } from "../../../shared/definitions/ResourceDefinitions";
import { IOCalculation, getElectrificationStatus } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { getBuildingIO, unlockedResources } from "../../../shared/logic/IntraTickCache";
import { Tick } from "../../../shared/logic/TickLogic";
import type { IBuildingData } from "../../../shared/logic/Tile";
import { forEach, formatPercent, keysOf, mReduceOf, safeAdd } from "../../../shared/utilities/Helper";
import type { PartialSet, PartialTabulate } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { WorldScene } from "../scenes/WorldScene";
import { jsxMMapOf } from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";

type Tab = "resources" | "buildings" | "transportation";

export function StatisticsBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IBuildingData;
   if (building == null) {
      return null;
   }
   const [currentTab, setCurrentTab] = useState<Tab>("resources");
   let content: JSX.Element | null = null;
   if (currentTab === "resources") {
      content = <ResourcesTab gameState={gameState} xy={xy} />;
   } else if (currentTab === "buildings") {
      content = <BuildingTab gameState={gameState} xy={xy} />;
   } else if (currentTab === "transportation") {
      content = <TransportationTab gameState={gameState} xy={xy} />;
   }
   return (
      <div className="window-body column">
         <menu role="tablist">
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
                                       Singleton().sceneManager.getCurrent(WorldScene)?.lookAtXy(xy);
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
                     ) / Tick.current.workersUsed.Worker!,
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

type SortByOptions = "name" | "amount" | "input" | "output";
type SortOrder = "asc" | "desc";

function ResourcesTab({ gameState }: IBuildingComponentProps): React.ReactNode {
   const [showTheoreticalValue, setShowTheoreticalValue] = useState(true);
   const [sortBy, setSortBy] = useState<SortByOptions>("name");
   const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
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
         Tick.current.resourcesByTile[res]?.reduce(
            (prev, curr) => prev + (gameState.tiles.get(curr)?.building?.resources?.[res] ?? 0),
            0,
         ) ?? 0;
   });

   const handleSortClick = (sortBy: SortByOptions) => {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      setSortBy(sortBy);
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
         <div className="table-view sticky-header f1">
            <table>
               <thead>
                  <tr>
                     <th onClick={() => handleSortClick("name")}>
                        {sortBy === "name" ? (
                           <div className="f1 m-icon small">
                              {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                           </div>
                        ) : (
                           <div className="f1" />
                        )}
                     </th>
                     <th onClick={() => handleSortClick("amount")}>
                        <div className="row">
                           {sortBy === "amount" ? (
                              <div className="f1 m-icon small">
                                 {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                              </div>
                           ) : (
                              <div className="f1" />
                           )}
                           <div>{t(L.ResourceAmount)}</div>
                        </div>
                     </th>
                     <th onClick={() => handleSortClick("output")}>
                        <div className="row">
                           {sortBy === "output" ? (
                              <div className="f1 m-icon small">
                                 {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                              </div>
                           ) : (
                              <div className="f1" />
                           )}
                           <div className="m-icon small">output</div>
                        </div>
                     </th>
                     <th onClick={() => handleSortClick("input")}>
                        <div className="row">
                           {sortBy === "input" ? (
                              <div className="f1 m-icon small">
                                 {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                              </div>
                           ) : (
                              <div className="f1" />
                           )}
                           <div className="m-icon small">exit_to_app</div>
                        </div>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {keysOf(unlockedResourcesList)
                     .sort((a, b) => {
                        const aIdx = sortOrder === "asc" ? a : b;
                        const bIdx = sortOrder === "asc" ? b : a;
                        if (sortBy === "amount") {
                           return (resourceAmounts[aIdx] ?? 0) - (resourceAmounts[bIdx] ?? 0);
                        }
                        if (sortBy === "input") {
                           return (inputs[aIdx] ?? 0) - (inputs[bIdx] ?? 0);
                        }
                        if (sortBy === "output") {
                           return (outputs[aIdx] ?? 0) - (outputs[bIdx] ?? 0);
                        }
                        return Config.Resource[aIdx].name().localeCompare(Config.Resource[bIdx].name());
                     })
                     .map((res) => {
                        const r = Config.Resource[res];
                        if (!r.canPrice || !r.canStore) {
                           return null;
                        }
                        const output = outputs[res] ?? 0;
                        const input = inputs[res] ?? 0;
                        return (
                           <tr key={res}>
                              <td>{r.name()}</td>
                              <td className="right">
                                 <FormatNumber value={resourceAmounts[res]} />
                              </td>
                              <td className="right">
                                 <FormatNumber value={output} />
                              </td>
                              <td className={classNames({ right: true, "text-red": input > output })}>
                                 <FormatNumber value={input} />
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
