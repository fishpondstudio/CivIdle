import { useState } from "react";
import { notifyGameStateUpdate } from "../Global";
import { getBuildingCost, getBuildingUpgradeLevels } from "../logic/BuildingLogic";
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
   const cost = getBuildingCost(building);
   const levels = getBuildingUpgradeLevels(building);
   const [upgradeLevel, setUpgradeLevel] = useState(levels[0]);
   return (
      <>
         <fieldset>
            <div className="text-strong row">
               <div className="f1">{t(L.Level)}</div>
               <div>{building.level}</div>
            </div>
         </fieldset>
         <fieldset>
            <legend>{t(L.UpgradeCost)}</legend>
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
            <div className="separator"></div>
            <div className="row">
               <select
                  className="f1"
                  value={upgradeLevel}
                  onChange={(v) => {
                     setUpgradeLevel(parseInt(v.target.value, 10));
                  }}
               >
                  {levels.map((level) => (
                     <option key={level} value={level}>
                        x{level}
                     </option>
                  ))}
               </select>
               <div style={{ width: "10px" }}></div>
               <button
                  onClick={() => {
                     building.desiredLevel = building.level + upgradeLevel;
                     building.status = "upgrading";
                     notifyGameStateUpdate();
                  }}
               >
                  {t(L.Upgrade)}
               </button>
            </div>
         </fieldset>
      </>
   );
}
