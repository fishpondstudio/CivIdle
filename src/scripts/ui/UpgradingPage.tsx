import classNames from "classnames";
import { notifyGameStateUpdate, useGameState } from "../Global";
import { Tick } from "../logic/TickLogic";
import { ITileData } from "../logic/Tile";
import { L, t } from "../utilities/i18n";
import { BuildingConstructionProgressComponent } from "./BuildingConstructionProgressComponent";
import { MenuComponent } from "./MenuComponent";

export function UpgradingPage({ tile }: { tile: ITileData }): React.ReactNode {
   const building = tile.building;
   if (!building) {
      return null;
   }
   const gs = useGameState();
   const definition = Tick.current.buildings[building.type];
   const canDecreaseDesiredLevel = building.desiredLevel > building.level + 1;
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{definition.name()}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <BuildingConstructionProgressComponent xy={tile.xy} gameState={gs} />
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
                     <div style={{ width: "40px", textAlign: "center" }}>
                        {building.desiredLevel}
                     </div>
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
         </div>
      </div>
   );
}
