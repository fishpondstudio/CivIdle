import { isNaturalWonder, isWorldWonder } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { L, t } from "../../../shared/utilities/i18n";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingSpriteComponent } from "./TextureSprites";

export function BuildingDescriptionComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const type = gameState.tiles.get(xy)?.building?.type;
   if (!type) {
      return null;
   }
   const building = Config.Building[type];
   if (!building.desc) {
      return null;
   }
   return (
      <fieldset className="row">
         {isWorldWonder(type) ? <legend>{t(L.Wonder)}</legend> : null}
         {isNaturalWonder(type) ? <legend>{t(L.NaturalWonder)}</legend> : null}
         <div className="mr10">
            <BuildingSpriteComponent building={type} scale={0.5} style={{ filter: "invert(0.75)" }} />
         </div>
         <div>{building.desc()}</div>
      </fieldset>
   );
}
