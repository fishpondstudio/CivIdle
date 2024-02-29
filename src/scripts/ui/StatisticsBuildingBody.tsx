import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useState } from "react";
import {
   NoPrice,
   NoStorage,
   type Resource,
   type ResourceDefinitions,
} from "../../../shared/definitions/ResourceDefinitions";
import { IOCalculation, getElectrificationStatus } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { getBuildingIO, unlockedResources } from "../../../shared/logic/IntraTickCache";
import { Tick } from "../../../shared/logic/TickLogic";
import type { IBuildingData } from "../../../shared/logic/Tile";
import {
   forEach,
   formatHMS,
   formatNumber,
   formatPercent,
   keysOf,
   mReduceOf,
   safeAdd,
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

type Tab = "resources" | "buildings" | "transportation";

export function StatisticsBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IBuildingData;
   if (building == null) {
      return null;
   }
   const [currentTab, setCurrentTab] = useState<Tab>("resources");
   let content: React.ReactNode = null;
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
                              <FormatNumber value={output} /> - <FormatNumber value={input} />
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
