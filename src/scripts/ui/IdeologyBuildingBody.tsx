import { Config } from "../../../shared/logic/Config";
import type { IIdeologyBuildingData } from "../../../shared/logic/Tile";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { UpgradeGroupComponent } from "./UpgradeGroupComponent";
import { WarningComponent } from "./WarningComponent";

export function IdeologyBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IIdeologyBuildingData;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         {!building.ideology ? (
            <WarningComponent icon="info" className="text-small mb10">
               <RenderHTML html={t(L.IdeologyDescHTML)} />
            </WarningComponent>
         ) : null}
         {jsxMapOf(Config.Ideology, (ideology, def) => {
            if (building.ideology && building.ideology !== ideology) {
               return null;
            }
            return (
               <fieldset key={ideology}>
                  <legend>{def.name()}</legend>
                  <UpgradeGroupComponent
                     self={ideology}
                     upgrades={def.content}
                     building={building}
                     getSelected={() => building.ideology}
                     setSelected={(v) => {
                        building.ideology = v;
                     }}
                  />
               </fieldset>
            );
         })}
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
