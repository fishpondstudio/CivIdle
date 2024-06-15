import { Config } from "../../../shared/logic/Config";
import type { ITraditionBuildingData } from "../../../shared/logic/Tile";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { UpgradeGroupComponent } from "./UpgradeGroupComponent";
import { WarningComponent } from "./WarningComponent";

export function TraditionBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as ITraditionBuildingData;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         {!building.tradition ? (
            <WarningComponent icon="info" className="text-small mb10">
               <RenderHTML html={t(L.TraditionDescHTML)} />
            </WarningComponent>
         ) : null}
         {jsxMapOf(Config.Tradition, (tradition, def) => {
            if (building.tradition && building.tradition !== tradition) {
               return null;
            }
            return (
               <fieldset key={tradition}>
                  <legend>{def.name()}</legend>
                  <UpgradeGroupComponent
                     self={tradition}
                     upgrades={def.content}
                     building={building}
                     getSelected={() => building.tradition}
                     setSelected={(v) => {
                        building.tradition = v;
                     }}
                  />
               </fieldset>
            );
         })}
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
