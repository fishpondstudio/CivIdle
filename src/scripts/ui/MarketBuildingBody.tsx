import { Config } from "../logic/Constants";
import { Tick } from "../logic/TickLogic";
import { jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStockpileComponent } from "./BuildingStockpileComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWarningComponent } from "./BuildingWarningComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { FormatNumber } from "./HelperComponents";

export function MarketBuildingBody({ gameState, xy }: IBuildingComponentProps) {
   return (
      <div className="window-body">
         <div className="table-view">
            <table>
               <thead>
                  <tr>
                     <th></th>
                     <th className="right">{t(L.MarketPrice)}</th>
                     <th className="right">{t(L.MarketAmount)}</th>
                     <th style={{ width: 0 }}>{t(L.MarketSell)}</th>
                  </tr>
               </thead>
               <tbody>
                  {jsxMapOf(Tick.current.resourcesByBuilding, (res, xys) => {
                     const r = Tick.current.resources[res];
                     if (!r.canPrice || !r.canStore) {
                        return null;
                     }
                     return (
                        <tr>
                           <td>{r.name()}</td>
                           <td className="right">
                              $<FormatNumber value={Config.ResourcePrice[res]} />
                           </td>
                           <td className="right">
                              <FormatNumber
                                 value={xys.reduce(
                                    (prev, curr) => prev + (gameState.tiles[curr].building?.resources?.[res] ?? 0),
                                    0
                                 )}
                              />
                           </td>
                           <td>
                              <div className="m-icon text-green">toggle_on</div>
                              {/* <div className="m-icon text-grey">toggle_off</div> */}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
         <div className="sep10"></div>
         <BuildingWarningComponent gameState={gameState} xy={xy} />
         <BuildingUpgradeComponent gameState={gameState} xy={xy} />
         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingStockpileComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
