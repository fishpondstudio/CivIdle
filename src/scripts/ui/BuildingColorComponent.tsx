import { NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { jsxMapOf } from "../utilities/Helper";
import type { IBuildingComponentProps } from "./BuildingPage";
import { ColorPicker } from "./ColorPicker";

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
               <ColorPicker
                  value={gameOptions.buildingColors[building.type] ?? "#ffffff"}
                  onChange={(v) => {
                     gameOptions.buildingColors[building.type] = v;
                     notifyGameOptionsUpdate();
                  }}
                  timeout={250}
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
   if (!NoStorage[resource]) {
      return (
         <div className="row mv5">
            <div className="f1">{r.name()}</div>
            <div>
               <ColorPicker
                  value={gameOptions.resourceColors[resource] ?? "#ffffff"}
                  onChange={(v) => {
                     gameOptions.resourceColors[resource] = v;
                     notifyGameOptionsUpdate();
                  }}
                  timeout={250}
               />
            </div>
         </div>
      );
   }
   return null;
}
