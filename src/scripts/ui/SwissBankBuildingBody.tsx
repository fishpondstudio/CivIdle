import type React from "react";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { ISwissBankBuildingData } from "../../../shared/logic/Tile";
import { formatNumber, keysOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function SwissBankBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as ISwissBankBuildingData;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <fieldset>
            <select
               className="w100"
               value={building.resource ?? ""}
               onChange={(e) => {
                  const val = e.target.value;
                  if (!val || val in NoPrice || val in NoStorage || val === "Koti") {
                     building.resource = null;
                  } else {
                     building.resource = val as Resource;
                  }
                  notifyGameStateUpdate();
               }}
            >
               <option value=""></option>
               {keysOf(Config.Resource)
                  .sort((a, b) => Config.Resource[a].name().localeCompare(Config.Resource[b].name()))
                  .map((res) => {
                     if (NoPrice[res] || NoStorage[res] || res === "Koti") {
                        return null;
                     }
                     return (
                        <option key={res} value={res}>
                           {Config.Resource[res].name()}
                        </option>
                     );
                  })}
            </select>
            <div className="separator" />
            <div className="row">
               <div className="f1">{t(L.Koti)}</div>
               <div className="text-strong">{formatNumber(building.resources.Koti ?? 0)}</div>
            </div>
         </fieldset>
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
