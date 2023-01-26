import { notifyGameStateUpdate, useGameState } from "../Global";
import { Tick } from "../logic/TickLogic";
import { ITileData } from "../logic/Tile";
import { L, t } from "../utilities/i18n";
import { BuildingConstructionProgressComponent } from "./BuildingConstructionProgressComponent";
import { BuildingWarningComponent } from "./BuildingWarningComponent";
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
            <BuildingWarningComponent xy={tile.xy} gameState={gs} />
            <BuildingConstructionProgressComponent xy={tile.xy} gameState={gs} />
            <fieldset>
               <legend>{t(L.CancelUpgrade)}</legend>
               <div className="row">
                  <div>{t(L.CancelUpgradeDesc)}</div>
                  <div className="ml10">
                     <button
                        className="nowrap"
                        onClick={() => {
                           building.status = "completed";
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
