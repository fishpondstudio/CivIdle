import classNames from "classnames";
import { useState } from "react";
import { notifyGameStateUpdate } from "../Global";
import { getBuildingUpgradeCost, getBuildingUpgradeLevels } from "../logic/BuildingLogic";
import {} from "../logic/GameState";
import { Tick } from "../logic/TickLogic";
import { jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";

export function BuildingUpgradeComponent({ gameState, xy }: IBuildingComponentProps) {
   const building = gameState.tiles[xy]?.building;
   if (!building) {
      return null;
   }
   if ((Tick.current.buildings[building.type]?.max ?? Infinity) <= 1) {
      return null;
   }
   const levels = getBuildingUpgradeLevels(building);
   const [selected, setSelected] = useState(0);
   const cost = getBuildingUpgradeCost(building.type, building.level, building.level + levels[selected]);
   return (
      <>
         <fieldset>
            <legend className="text-strong">
               {t(L.Level)} {building.level}
            </legend>
            <div className="row">
               <div className="f1">{t(L.Upgrade)}</div>
               {levels.map((level, index) => (
                  <button
                     key={level}
                     style={{ width: "60px" }}
                     className={classNames({ "text-strong": index == selected })}
                     onMouseOver={setSelected.bind(null, index)}
                     onClick={() => {
                        building.desiredLevel = building.level + level;
                        building.status = "upgrading";
                        notifyGameStateUpdate();
                     }}
                  >
                     x{level}
                  </button>
               ))}
            </div>
            <div className="sep5"></div>
            <div className="text-desc text-small">
               {jsxMapOf(cost, (res, amount) => {
                  return (
                     <div className="row mv5" key={res}>
                        <div className="f1">{Tick.current.resources[res].name()}</div>
                        <div className="text-strong">
                           <FormatNumber value={amount} />
                        </div>
                     </div>
                  );
               })}
            </div>
         </fieldset>
      </>
   );
}
