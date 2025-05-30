import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { keysOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { playClick } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { resourceWatchList, toggleResourceWatch } from "./ResourceWatchWindow";

export function BuildingResourceWatch({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   const building = tile?.building;
   if (!building) {
      return null;
   }
   const gameOptions = useGameOptions();
   const def = Config.Building[building.type];
   const buildingColor = gameOptions.buildingColors[building.type] ?? "#ffffff";
   return (
      <fieldset>
         <legend>{t(L.ResourceWatch)}</legend>
         {keysOf(building.resources)
            .sort((a, b) => {
               return building.resources[b]! - building.resources[a]!;
            })
            .map((res) => {
               return (
                  <div
                     className="row pointer"
                     key={res}
                     onClick={() => {
                        playClick();
                        toggleResourceWatch(res);
                        notifyGameStateUpdate();
                     }}
                  >
                     <div className="f1">{Config.Resource[res].name()}</div>
                     <div>
                        {resourceWatchList.includes(res) ? (
                           <div className="m-icon text-green">toggle_on</div>
                        ) : (
                           <div className="m-icon text-grey">toggle_off</div>
                        )}
                     </div>
                  </div>
               );
            })}
      </fieldset>
   );
}
