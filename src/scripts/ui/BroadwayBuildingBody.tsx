import classNames from "classnames";
import { GreatPersonType } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getGreatPersonTotalEffect, sortGreatPeople } from "../../../shared/logic/RebornLogic";
import type { IGreatPeopleBuildingData } from "../../../shared/logic/Tile";
import { keysOf } from "../../../shared/utilities/Helper";
import { GreatPersonImage } from "../visuals/GreatPersonVisual";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function BroadwayBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IGreatPeopleBuildingData;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <div className="table-view mb10">
            <table>
               <tbody>
                  {keysOf(Config.GreatPerson)
                     .sort(sortGreatPeople)
                     .map((k) => {
                        const def = Config.GreatPerson[k];
                        if (def.type !== GreatPersonType.Normal) return null;
                        const effect = getGreatPersonTotalEffect(k, gameState);
                        if (effect <= 0) return null;
                        const active = building.greatPeople.has(k);
                        return (
                           <tr key={k}>
                              <td>
                                 <GreatPersonImage
                                    greatPerson={k}
                                    style={{ height: "50px", display: "block" }}
                                 />
                              </td>
                              <td>
                                 <div className="mv5">
                                    <div>
                                       <span className="text-strong">{def.name()}</span>
                                       <span className="text-desc ml5">{Config.TechAge[def.age].name()}</span>
                                    </div>
                                    <div className="text-small text-desc">{def.desc(def, effect)}</div>
                                 </div>
                              </td>
                              <td></td>
                              <td>
                                 <div
                                    className={classNames({
                                       "m-icon pointer": true,
                                       "text-desc": !active,
                                       "text-green": active,
                                    })}
                                    onClick={() => {
                                       playClick();
                                       building.greatPeople.clear();
                                       building.greatPeople.add(k);
                                       notifyGameStateUpdate();
                                    }}
                                 >
                                    {active ? "toggle_on" : "toggle_off"}
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
               </tbody>
            </table>
         </div>
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
