import { Config } from "../../../shared/logic/Config";
import type { IReligionBuildingData } from "../../../shared/logic/Tile";
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

export function ReligionBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IReligionBuildingData;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         {!building.religion ? (
            <WarningComponent icon="info" className="text-small mb10">
               <RenderHTML html={t(L.ReligionDescHTML)} />
            </WarningComponent>
         ) : null}
         {jsxMapOf(Config.Religion, (religion, def) => {
            if (building.religion && building.religion !== religion) {
               return null;
            }
            return (
               <fieldset key={religion}>
                  <legend>{def.name()}</legend>
                  <UpgradeGroupComponent
                     self={religion}
                     upgrades={def.content}
                     building={building}
                     getSelected={() => building.religion}
                     setSelected={(v) => {
                        building.religion = v;
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
