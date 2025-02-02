import type React from "react";
import { useState } from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import {
   applyBuildingDefaults,
   getBuildingCost,
   getUniqueWonders,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { RequestResetTile } from "../../../shared/logic/TechLogic";
import { makeBuilding } from "../../../shared/logic/Tile";
import { forEach } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playUpgrade } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function BritishMuseumBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const buildings = getUniqueWonders(gameState.city);
   const [building, setBuilding] = useState(buildings[0]);
   return (
      <div className="window-body">
         <fieldset>
            <legend>{t(L.BritishMuseumChooseWonder)}</legend>
            <div className="row">
               <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value as Building)}
                  className="f1 mr10"
               >
                  {buildings.map((building) => {
                     return (
                        <option key={building} value={building}>
                           {Config.Building[building].name()}
                        </option>
                     );
                  })}
               </select>
               <button
                  onClick={() => {
                     const tile = gameState.tiles.get(xy);
                     if (!tile) {
                        return;
                     }
                     const wonder = applyBuildingDefaults(makeBuilding({ type: building }), getGameOptions());
                     forEach(getBuildingCost(wonder), (res, amount) => {
                        wonder.resources[res] = amount;
                     });
                     tile.building = wonder;
                     RequestResetTile.emit(xy);
                     notifyGameStateUpdate();
                     playUpgrade();
                  }}
               >
                  {t(L.BritishMuseumTransform)}
               </button>
            </div>
            <div className="mt5 text-desc text-small">{Config.Building[building].desc?.()}</div>
         </fieldset>
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
