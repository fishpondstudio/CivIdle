import classNames from "classnames";
import { useState } from "react";
import { GreatPersonType } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getGreatPersonTotalLevel, sortGreatPeople } from "../../../shared/logic/RebirthLogic";
import type { IGreatPeopleBuildingData } from "../../../shared/logic/Tile";
import { keysOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { GreatPersonImage } from "../visuals/GreatPersonVisual";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

let greatPeopleFilter = "";

export function BroadwayBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IGreatPeopleBuildingData;
   if (!building) {
      return null;
   }
   const [filter, setFilter] = useState(greatPeopleFilter);
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />

         {building.greatPeople.size === 0 ? null : (
            <fieldset>
               <legend>{t(L.BroadwayCurrentlySelected)}</legend>
               {[...building.greatPeople].map((gp) => {
                  const def = Config.GreatPerson[gp];
                  const effect = getGreatPersonTotalLevel(gp, gameState);
                  if (effect <= 0) return null;
                  if (def.type !== GreatPersonType.Normal && def.type !== GreatPersonType.Adaptive) {
                     return null;
                  }
                  return (
                     <div key={gp} className="row mb5">
                        <GreatPersonImage greatPerson={gp} style={{ height: "50px", display: "block" }} />
                        <div className="ml10">
                           <div>
                              <span className="text-strong">{def.name()}</span>
                              <span className="text-desc ml5">{Config.TechAge[def.age].name()}</span>
                           </div>
                           <div className="text-small text-desc">{def.desc(def, effect)}</div>
                        </div>
                     </div>
                  );
               })}
            </fieldset>
         )}

         <input
            value={filter}
            onChange={(e) => {
               greatPeopleFilter = e.target.value;
               setFilter(greatPeopleFilter);
            }}
            type="text"
            className="w100 mb10"
            placeholder={t(L.GreatPeopleFilter)}
         />
         <div className="table-view mb10">
            <table>
               <tbody>
                  {keysOf(Config.GreatPerson)
                     .filter((gp) => {
                        const def = Config.GreatPerson[gp];
                        if (def.name().toLowerCase().includes(filter.toLowerCase())) {
                           return true;
                        }

                        if (
                           def.boost?.buildings.some((b) => {
                              const outputResources = keysOf(Config.Building[b].output).some((r) => {
                                 return Config.Material[r]
                                    .name()
                                    .toLocaleLowerCase()
                                    .includes(filter.toLowerCase());
                              });

                              return (
                                 Config.Building[b]
                                    .name()
                                    .toLocaleLowerCase()
                                    .includes(filter.toLowerCase()) || outputResources
                              );
                           })
                        ) {
                           return true;
                        }

                        if (Config.TechAge[def.age].name().toLowerCase().includes(filter.toLowerCase())) {
                           return true;
                        }
                        return false;
                     })
                     .sort(sortGreatPeople)
                     .map((k) => {
                        const def = Config.GreatPerson[k];
                        if (def.type !== GreatPersonType.Normal && def.type !== GreatPersonType.Adaptive) {
                           return null;
                        }
                        const effect = getGreatPersonTotalLevel(k, gameState);
                        if (effect <= 0) return null;
                        const active = building.greatPeople.has(k);
                        return (
                           <tr key={k}>
                              <td style={{ width: 0 }}>
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
                              <td style={{ width: 0 }}>
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
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
