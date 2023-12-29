import { notifyGameStateUpdate } from "../Global";
import { BUILDING_POWER_TO_LEVEL, applyToAllBuildings, canBeElectrified } from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import { GameFeature, hasFeature } from "../logic/FeatureLogic";
import { BuildingOptions } from "../logic/Tile";
import { copyFlag, hasFlag, toggleFlag } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingElectricityComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles[xy].building;
   if (!hasFeature(GameFeature.Electricity, gameState) || !building) {
      return null;
   }
   if (!canBeElectrified(building.type)) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.Electrification)}</legend>
         <div className="row">
            <div className="f1">
               {t(L.ElectrificationDesc, {
                  power: building.level * BUILDING_POWER_TO_LEVEL,
                  level: building.level,
               })}
            </div>
            <div
               className="pointer"
               onClick={() => {
                  playClick();
                  building.options = toggleFlag(building.options, BuildingOptions.Electrification);
                  notifyGameStateUpdate();
               }}
            >
               {hasFlag(building.options, BuildingOptions.Electrification) ? (
                  <div className="m-icon text-green">toggle_on</div>
               ) : (
                  <div className="m-icon text-desc">toggle_off</div>
               )}
            </div>
         </div>
         <div className="sep5"></div>
         <div className="separator"></div>
         <div className="row">
            <div className="f1">{t(L.ElectrificationStatus)}</div>
            <div>OK</div>
         </div>
         <div className="separator"></div>
         <div
            className="text-link text-small"
            onClick={() => {
               playClick();
               applyToAllBuildings(
                  building.type,
                  (b) => ({
                     options: copyFlag(building.options, b.options, BuildingOptions.Electrification),
                  }),
                  gameState,
               );
            }}
         >
            {t(L.ApplyToAll, { building: Config.Building[building.type].name() })}
         </div>
      </fieldset>
   );
}
