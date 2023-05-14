import { notifyGameStateUpdate, useGameState } from "../Global";
import { Tick } from "../logic/TickLogic";
import { ITileData } from "../logic/Tile";
import { L, t } from "../utilities/i18n";
import { BuildingConstructionProgressComponent } from "./BuildingConstructionProgressComponent";
import { MenuComponent } from "./MenuComponent";

export function UpgradingPage({ tile }: { tile: ITileData }) {
   const building = tile.building;
   if (!building) {
      return null;
   }
   const gs = useGameState();
   const definition = Tick.current.buildings[building.type];
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{definition.name()}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <BuildingConstructionProgressComponent xy={tile.xy} gameState={gs} />
            <fieldset>
               <div className="row text-strong">
                  <div className="f1">{t(L.UpgradeBuilding)}</div>
                  <div>{building.level}</div>
                  <div className="m-icon" style={{ fontSize: "17px", margin: "0 5px" }}>
                     keyboard_double_arrow_right
                  </div>
                  <div>{building.desiredLevel}</div>
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
