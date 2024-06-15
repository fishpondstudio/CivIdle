import { getTransportStat } from "../../../shared/logic/IntraTickCache";
import { Tick } from "../../../shared/logic/TickLogic";
import { formatPercent } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";

export function EuphratesRiverBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const stat = getTransportStat(gameState);
   const productionWorkers = (Tick.current.workersUsed.get("Worker") ?? 0) - stat.totalFuel;
   const totalWorkers =
      (Tick.current.workersAvailable.get("Worker") ?? 0) * (Tick.current.happiness?.workerPercentage ?? 0);
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.TotalWorkers)}</div>
               <div className="text-strong">
                  <FormatNumber value={totalWorkers} />
               </div>
            </div>
            <div className="row">
               <div className="f1">{t(L.ProductionWorkers)}</div>
               <div className="text-strong">
                  <FormatNumber value={productionWorkers} />
               </div>
            </div>
            <div className="row">
               <div className="f1">{t(L.PercentageOfProductionWorkers)}</div>
               <div className="text-strong">{formatPercent(productionWorkers / totalWorkers)}</div>
            </div>
         </fieldset>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
