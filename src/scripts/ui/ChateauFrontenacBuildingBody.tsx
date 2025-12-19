import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { IChateauFrontenacBuildingData } from "../../../shared/logic/Tile";
import { cls, mapOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick, playError } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { SpaceshipIdleComponent } from "./SpaceshipIdleComponent";
import { UpgradeableWonderComponent } from "./UpgradeableWonderComponent";

export function ChateauFrontenacBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IChateauFrontenacBuildingData;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <SpaceshipIdleComponent gameState={gameState} type={building.type} />
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            {mapOf(building.buildings, (level, data) => {
               return (
                  <div className="row mv5" key={level}>
                     <div
                        style={{ width: 100 }}
                        className={cls(data.selected === undefined ? "text-strong" : "")}
                     >
                        {t(L.LevelX, { level })}
                     </div>
                     <select
                        disabled={data.selected !== undefined}
                        className="f1"
                        value={data.selected}
                        onChange={(e) => {
                           if (data.selected) {
                              playError();
                              return;
                           }
                           playClick();
                           data.selected = e.target.value as Building;
                           notifyGameStateUpdate();
                        }}
                     >
                        <option></option>
                        {data.options.map((option) => {
                           return (
                              <option key={option} value={option}>
                                 {Config.Building[option].name()}
                              </option>
                           );
                        })}
                     </select>
                  </div>
               );
            })}
         </fieldset>
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
