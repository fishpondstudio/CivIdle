import { notifyGameOptionsUpdate, useGameOptions } from "../Global";
import type { Resource } from "../definitions/ResourceDefinitions";
import { Config } from "../logic/Config";
import { jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingColorComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (!building) {
      return null;
   }
   const gameOptions = useGameOptions();
   const def = Config.Building[building.type];
   return (
      <fieldset>
         <legend>{t(L.BuildingColor)}</legend>
         <div className="row mv5">
            <div className="f1">{def.name()}</div>
            <div>
               <input
                  type="color"
                  value={gameOptions.buildingColors[building.type] ?? "#ffffff"}
                  onChange={(v) => {
                     gameOptions.buildingColors[building.type] = v.target.value;
                     notifyGameOptionsUpdate();
                  }}
               />
            </div>
         </div>
         {jsxMapOf(def.input, (res) => {
            return <ResourceColor key={res} resource={res} />;
         })}
         {jsxMapOf(def.output, (res) => {
            return <ResourceColor key={res} resource={res} />;
         })}
      </fieldset>
   );
}

function ResourceColor({ resource }: { resource: Resource }) {
   const r = Config.Resource[resource];
   const gameOptions = useGameOptions();
   if (r.canStore) {
      return (
         <div className="row mv5">
            <div className="f1">{r.name()}</div>
            <div>
               <input
                  type="color"
                  value={gameOptions.resourceColors[resource] ?? "#ffffff"}
                  onChange={(v) => {
                     gameOptions.resourceColors[resource] = v.target.value;
                     notifyGameOptionsUpdate();
                  }}
               />
            </div>
         </div>
      );
   }
   return null;
}
