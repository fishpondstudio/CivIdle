import classNames from "classnames";
import {
   ElectrificationStatus,
   canBeElectrified,
   getElectrificationStatus,
   getPowerRequired,
} from "../../../shared/logic/BuildingLogic";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { formatNumber } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import type { IBuildingComponentProps } from "./BuildingPage";

export function BuildingElectricityComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
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
            power: formatNumber(getPowerRequired(building.electrification)),
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
         <ApplyToAllComponent
            building={building}
            getOptions={() => ({ electrification: building.electrification })}
            gameState={gameState}
         />
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
