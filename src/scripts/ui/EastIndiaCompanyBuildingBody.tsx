import type React from "react";
import { EAST_INDIA_COMPANY_BOOST_PER_EV } from "../../../shared/logic/Constants";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";

export function EastIndiaCompanyBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <fieldset>
            <div className="row mv5">
               <div className="f1">{t(L.TradeValue)}</div>
               <div className="text-strong">
                  <FormatNumber value={building.resources.TradeValue ?? 0} />
               </div>
            </div>
            <div className="row mv5">
               <div className="f1">{t(L.BoostCyclesLeft)}</div>
               <div className="text-strong">
                  <FormatNumber
                     value={Math.floor(
                        (building.resources.TradeValue ?? 0) / EAST_INDIA_COMPANY_BOOST_PER_EV,
                     )}
                  />
               </div>
            </div>
         </fieldset>
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
