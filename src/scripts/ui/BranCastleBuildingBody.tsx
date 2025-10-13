import { getBranCastleRequiredWorkers, getScienceFromWorkers } from "../../../shared/logic/BuildingLogic";
import { LogicResult } from "../../../shared/logic/LogicResult";
import { cls, range } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";

export function BranCastleBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const { workersAfterHappiness } = getScienceFromWorkers(gameState);
   return (
      <div className="window-body">
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.ProducedWorkers)}</div>
               <div className="text-strong">
                  <FormatNumber value={LogicResult.branCastleGeneratedWorkers} />
               </div>
            </div>
            <div className="row">
               <div className="f1">{t(L.EmployedVampires)}</div>
               <div className="text-strong">
                  <FormatNumber value={LogicResult.branCastleEmployedWorkers} />
               </div>
            </div>
            <div className="separator" />
            <div className="table-view">
               <table>
                  <thead>
                     <tr>
                        <th>Level</th>
                        <th className="right">{t(L.RequiredTotalWorkers)}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {range(LogicResult.branCastleLevel, LogicResult.branCastleLevel + 5).map((i) => {
                        const workerRequired = getBranCastleRequiredWorkers(i);
                        return (
                           <tr
                              key={i}
                              className={cls(workersAfterHappiness >= workerRequired ? "text-strong" : "")}
                           >
                              <td>{i}</td>
                              <td className="right">
                                 <FormatNumber value={workerRequired} />
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </fieldset>
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
