import classNames from "classnames";
import { notifyGameStateUpdate } from "../Global";
import {
   BUILDING_POWER_TO_LEVEL,
   ElectrificationStatus,
   applyToAllBuildings,
   canBeElectrified,
   getElectrificationStatus,
} from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import { GameFeature, hasFeature } from "../logic/FeatureLogic";
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
   const status = getElectrificationStatus(xy, gameState);
   return (
      <fieldset>
         <legend>{t(L.Electrification)}</legend>
         {t(L.ElectrificationDesc, {
            power: building.electrification * BUILDING_POWER_TO_LEVEL,
            level: building.electrification,
         })}
         <div className="sep5"></div>
         <input
            id="building-capacity"
            type="range"
            min="0"
            max={building.level}
            step="1"
            value={building.electrification}
            onChange={(e) => {
               building.electrification = parseFloat(e.target.value);
               notifyGameStateUpdate();
            }}
            className="mh0"
         />
         <div className="sep15" />
         <div
            className="text-link text-small"
            onClick={() => {
               playClick();
               applyToAllBuildings(
                  building.type,
                  () => ({ electrification: building.electrification }),
                  gameState,
               );
            }}
         >
            {t(L.ApplyToAll, { building: Config.Building[building.type].name() })}
         </div>
         <div className="separator"></div>
         <div className="row">
            <div className="f1">{t(L.ElectrificationStatus)}</div>
            {status === "Active" ? <div className="m-icon small text-green">bolt</div> : null}
            <div
               className={classNames({
                  "text-strong": true,
                  "text-green": status === "Active",
                  "text-desc": status !== "Active",
               })}
            >
               {ElectrificationStatus[status]()}
            </div>
         </div>
      </fieldset>
   );
}
