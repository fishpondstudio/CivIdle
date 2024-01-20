import classNames from "classnames";
import { useState } from "react";
import { getBuildingUpgradeLevels, getTotalBuildingCost } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import {} from "../../../shared/logic/GameState";
import { getGameOptions, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { useShortcut } from "../../../shared/logic/Shortcut";
import { getUpgradePriority, setUpgradePriority } from "../../../shared/logic/Tile";
import { numberToRoman } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";

export function BuildingUpgradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   if ((Config.Building[building.type]?.max ?? Infinity) <= 1) {
      return null;
   }
   const levels = getBuildingUpgradeLevels(building);
   const [selected, setSelected] = useState(0);
   const cost = getTotalBuildingCost(building.type, building.level, building.level + levels[selected]);
   const upgrade = (level: number) => {
      building.desiredLevel = building.level + level;
      building.status = "upgrading";
      building.priority = setUpgradePriority(
         building.priority,
         getUpgradePriority(getGameOptions().defaultPriority),
      );
      notifyGameStateUpdate();
   };
   useShortcut("BuildingPageUpgradeX1", () => upgrade(1), [xy]);
   useShortcut("BuildingPageUpgradeX5", () => upgrade(5), [xy]);
   useShortcut("BuildingPageUpgradeToNext10", () => upgrade(levels[levels.length - 1]), [xy]);
   return (
      <>
         <fieldset>
            <legend className="text-strong">
               {t(L.Level)} {building.level}
            </legend>
            <div className="row">
               <div className="f1"> {t(L.BuildingTier)}</div>
               <div className="text-strong">{numberToRoman(Config.BuildingTier[building.type]!)}</div>
            </div>
            <div className="sep5"></div>
            <div className="row">
               <div className="f1">{t(L.Upgrade)}</div>
               {levels.map((level, index) => (
                  <button
                     key={level}
                     style={{ width: "60px" }}
                     className={classNames({ "text-strong": index === selected })}
                     onMouseOver={setSelected.bind(null, index)}
                     onClick={() => upgrade(level)}
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
                        <div className="f1">{Config.Resource[res].name()}</div>
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
