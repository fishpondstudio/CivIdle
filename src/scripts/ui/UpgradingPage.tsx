import classNames from "classnames";
import { notifyGameStateUpdate, useGameState } from "../Global";
import { Config } from "../logic/Config";
import {
   PRIORITY_MAX,
   PRIORITY_MIN,
   getUpgradePriority,
   setUpgradePriority,
   type ITileData,
} from "../logic/Tile";
import { L, t } from "../utilities/i18n";
import { BuildingConstructionProgressComponent } from "./BuildingConstructionProgressComponent";
import { MenuComponent } from "./MenuComponent";

export function UpgradingPage({ tile }: { tile: ITileData }): React.ReactNode {
   const building = tile.building;
   if (!building) {
      return null;
   }
   const gs = useGameState();
   const definition = Config.Building[building.type];
   const canDecreaseDesiredLevel = building.desiredLevel > building.level + 1;
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{definition.name()}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <BuildingConstructionProgressComponent xy={tile.tile} gameState={gs} />
            <fieldset>
               <legend>{t(L.UpgradeBuilding)}</legend>
               <div className="row text-strong">
                  <div className="f1">{building.level}</div>
                  <div className="m-icon">keyboard_double_arrow_right</div>
                  <div
                     className="f1 row jce"
                     onWheel={(e) => {
                        if (e.deltaY < 0) {
                           building.desiredLevel++;
                           notifyGameStateUpdate();
                        }
                        if (e.deltaY > 0 && canDecreaseDesiredLevel) {
                           building.desiredLevel--;
                           notifyGameStateUpdate();
                        }
                     }}
                  >
                     <div
                        className={classNames({
                           "m-icon mr5": true,
                           "text-link": canDecreaseDesiredLevel,
                           "text-desc": !canDecreaseDesiredLevel,
                        })}
                        onClick={() => {
                           if (canDecreaseDesiredLevel) {
                              building.desiredLevel--;
                              notifyGameStateUpdate();
                           }
                        }}
                     >
                        indeterminate_check_box
                     </div>
                     <div style={{ width: "40px", textAlign: "center" }}>{building.desiredLevel}</div>
                     <div
                        className="m-icon ml5 text-link"
                        onClick={() => {
                           building.desiredLevel++;
                           notifyGameStateUpdate();
                        }}
                     >
                        add_box
                     </div>
                  </div>
               </div>
               <div className="separator"></div>
               <div className="row">
                  <div>{t(L.CancelUpgradeDesc)}</div>
                  <div className="ml10">
                     <button
                        className="nowrap"
                        onClick={() => {
                           building.status = "completed";
                           building.desiredLevel = building.level;
                           notifyGameStateUpdate();
                        }}
                     >
                        {t(L.CancelUpgrade)}
                     </button>
                  </div>
               </div>
            </fieldset>
            <fieldset>
               <legend>
                  {t(L.ConstructionPriority)}: {getUpgradePriority(building.priority)}
               </legend>
               <input
                  type="range"
                  min={PRIORITY_MIN}
                  max={PRIORITY_MAX}
                  step="1"
                  value={getUpgradePriority(building.priority)}
                  onChange={(e) => {
                     building.priority = setUpgradePriority(building.priority, parseInt(e.target.value, 10));
                     notifyGameStateUpdate();
                  }}
               />
               <div className="sep15"></div>
               <div className="text-desc text-small">{t(L.ProductionPriorityDesc)}</div>
            </fieldset>
         </div>
      </div>
   );
}
