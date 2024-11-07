import type React from "react";
import type { GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getCurrentAge } from "../../../shared/logic/TechLogic";
import type { IZugspitzeBuildingData } from "../../../shared/logic/Tile";
import { jsxMapOf } from "../utilities/Helper";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function ZugspitzeBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IZugspitzeBuildingData;
   if (!building) {
      return null;
   }
   const currentAge = getCurrentAge(gameState);
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />

         {jsxMapOf(Config.TechAge, (age, def) => {
            if (def.idx > Config.TechAge[currentAge].idx) {
               return null;
            }
            const selectedGreatPerson = building.greatPeople.get(age);
            return (
               <fieldset>
                  <div
                     className="text-desc text-small text-strong mb5"
                     style={{ textTransform: "uppercase" }}
                  >
                     {def.name()}
                  </div>
                  <div>
                     <select
                        className="w100"
                        value={building.greatPeople.get(age) ?? ""}
                        onChange={(e) => {
                           playClick();
                           const gp = e.target.value as GreatPerson;
                           if (gp) {
                              building.greatPeople.set(age, gp);
                           } else {
                              building.greatPeople.delete(age);
                           }
                           notifyGameStateUpdate();
                        }}
                     >
                        <option value=""></option>
                        {jsxMapOf(gameState.greatPeople, (gp) => {
                           if (gp === "Zenobia") {
                              return null;
                           }
                           return (
                              <option key={gp} value={gp}>
                                 {Config.GreatPerson[gp].name()}
                              </option>
                           );
                        })}
                     </select>
                  </div>
                  {selectedGreatPerson ? (
                     <div className="mt5 text-desc text-small">
                        {Config.GreatPerson[selectedGreatPerson].desc(
                           Config.GreatPerson[selectedGreatPerson],
                           gameState.festival ? 2 : 1,
                        )}
                     </div>
                  ) : null}
                  <div className="t"></div>
               </fieldset>
            );
         })}

         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
