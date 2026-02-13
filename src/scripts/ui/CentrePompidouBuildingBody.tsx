import type React from "react";
import { Config } from "../../../shared/logic/Config";
import type { ICentrePompidouBuildingData } from "../../../shared/logic/Tile";
import { jsxMapOf } from "../utilities/Helper";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function CentrePompidouBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as ICentrePompidouBuildingData;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <div className="table-view mv10">
            <table>
               {jsxMapOf(Config.City, (city, def) => {
                  return (
                     <tr key={city}>
                        <td className="text-strong">{def.name()}</td>
                        <td className="small text-right m-icon text-green">
                           {building.cities.has(city) ? "check_circle" : null}
                        </td>
                     </tr>
                  );
               })}
            </table>
         </div>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
