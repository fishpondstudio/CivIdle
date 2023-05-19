import classNames from "classnames";
import { useState } from "react";
import { Resource } from "../definitions/ResourceDefinitions";
import { PartialTabulate } from "../definitions/TypeDefinitions";
import { getBuildingIO } from "../logic/BuildingLogic";
import { Config } from "../logic/Constants";
import { unlockedResources } from "../logic/IntraTickCache";
import { Tick } from "../logic/TickLogic";
import { IBuildingData } from "../logic/Tile";
import { forEach, keysOf, safeAdd } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";

type Tab = "resources" | "buildings";

export function StatisticsBuildingBody({ gameState, xy }: IBuildingComponentProps) {
   const building = gameState.tiles[xy].building as IBuildingData;
   if (building == null) {
      return null;
   }
   const [currentTab, setCurrentTab] = useState<Tab>("resources");
   let content: JSX.Element | null = null;
   if (currentTab === "resources") {
      content = <ResourcesTab gameState={gameState} xy={xy} />;
   } else if (currentTab === "buildings") {
      content = <BuildingTab gameState={gameState} xy={xy} />;
   }
   return (
      <div className="window-body">
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
               {t(L.BuildingsResources)}
            </button>
         </menu>
         {content}
      </div>
   );
}

function BuildingTab({ gameState }: IBuildingComponentProps) {
   return (
      <article role="tabpanel">
         <div className="table-view">
            <table>
               <thead>
                  <tr>
                     <th></th>
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
                  {keysOf(gameState.tiles)
                     .flatMap((xy) => {
                        const building = gameState.tiles[xy].building;
                        return building ? [{ building, xy }] : [];
                     })
                     .sort((a, b) =>
                        Tick.current.buildings[a.building.type]
                           .name()
                           .localeCompare(Tick.current.buildings[b.building.type].name())
                     )
                     .map(({ building, xy }) => {
                        return (
                           <tr key={xy}>
                              <td>
                                 {Tick.current.notProducingReasons[xy] ? (
                                    <div className="m-icon small text-red">error</div>
                                 ) : (
                                    <div className="m-icon small text-green">check_circle</div>
                                 )}
                              </td>
                              <td>{Tick.current.buildings[building.type].name()}</td>
                              <td className="right">
                                 <FormatNumber value={building.level} />
                              </td>
                              <td className="right">
                                 <FormatNumber
                                    value={
                                       gameState.transportation[xy]?.reduce(
                                          (prev, curr) => prev + curr.fuelAmount,
                                          0
                                       ) ?? 0
                                    }
                                 />
                              </td>
                              <td
                                 className={classNames({
                                    "text-red": Tick.current.notProducingReasons[xy] === "NotEnoughWorkers",
                                 })}
                              >
                                 <FormatNumber value={Tick.current.workersAssignment[xy] ?? 0} />
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

function ResourcesTab({ gameState }: IBuildingComponentProps) {
   const [showTheoreticalValue, setShowTheoreticalValue] = useState(true);
   const inputs: PartialTabulate<Resource> = {};
   const outputs: PartialTabulate<Resource> = {};
   forEach(gameState.tiles, (xy, tile) => {
      const input = getBuildingIO(xy, "input", { multiplier: true, capacity: true }, gameState);
      const output = getBuildingIO(xy, "output", { multiplier: true, capacity: true }, gameState);
      if (!showTheoreticalValue && Tick.current.notProducingReasons[xy]) {
         return;
      }
      forEach(input, (res, amount) => safeAdd(inputs, res, amount));
      forEach(output, (res, amount) => safeAdd(outputs, res, amount));
   });
   return (
      <article role="tabpanel">
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
         <div className="table-view">
            <table>
               <thead>
                  <tr>
                     <th></th>
                     <th className="right">{t(L.MarketAmount)}</th>
                     <th className="right">
                        <div className="m-icon small">output</div>
                     </th>
                     <th className="right">
                        <div className="m-icon small">exit_to_app</div>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {keysOf(unlockedResources(gameState))
                     .sort((a, b) => (Config.ResourceTier[a] ?? 0) - (Config.ResourceTier[b] ?? 0))
                     .map((res) => {
                        const r = Tick.current.resources[res];
                        if (!r.canPrice || !r.canStore) {
                           return null;
                        }
                        const output = outputs[res] ?? 0;
                        const input = inputs[res] ?? 0;
                        return (
                           <tr key={res}>
                              <td>{r.name()}</td>
                              <td className="right">
                                 <FormatNumber
                                    value={
                                       Tick.current.resourcesByBuilding[res]?.reduce(
                                          (prev, curr) =>
                                             prev + (gameState.tiles[curr].building?.resources?.[res] ?? 0),
                                          0
                                       ) ?? 0
                                    }
                                 />
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
