import classNames from "classnames";
import {
   ElectrificationStatus,
   canBeElectrified,
   getElectrificationEfficiency,
   getElectrificationStatus,
   getPowerRequired,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { L, t } from "../../../shared/utilities/i18n";
import warning from "../../images/warning.png";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";
import { TextWithHelp } from "./TextWithHelpComponent";

export function BuildingElectricityComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!hasFeature(GameFeature.Electricity, gameState) || !building) {
      return null;
   }
   if (!canBeElectrified(building.type)) {
      return null;
   }
   const status = getElectrificationStatus(xy, gameState);
   const hasPower = Tick.current.powerGrid.has(xy);
   return (
      <fieldset>
         <legend>{t(L.Electrification)}</legend>
         {Config.Building[building.type].power ? (
            <div className="row text-strong">
               {hasPower ? null : <img src={warning} style={{ margin: "0 2px 0 0" }} />}
               <div className="f1">
                  <TextWithHelp content={t(L.RequirePowerDesc)}>{t(L.RequirePower)}</TextWithHelp>
               </div>
               <div className="ml10">
                  {hasPower ? (
                     <div className="m-icon text-green" style={{ fontSize: "2rem", margin: "-5px 0" }}>
                        power
                     </div>
                  ) : (
                     <div className="m-icon text-red" style={{ fontSize: "2rem", margin: "-5px 0" }}>
                        power_off
                     </div>
                  )}
               </div>
            </div>
         ) : null}
         <div className="sep5" />
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
         <div className="separator"></div>
         <ul className="tree-view">
            <li className="row">
               <div className="f1">{t(L.ElectrificationPowerRequired)}</div>
               <div className="text-strong">
                  <FormatNumber value={getPowerRequired(building)} binary={true} />W
               </div>
            </li>
            <li className="row">
               <div className="f1">{t(L.ConsumptionMultiplier)}</div>
               <div className="text-red text-strong">
                  +
                  <FormatNumber
                     value={building.electrification * getElectrificationEfficiency(building.type)}
                  />
               </div>
            </li>
            <li className="row">
               <div className="f1">{t(L.ProductionMultiplier)}</div>
               <div className="text-green text-strong">
                  +<FormatNumber value={building.electrification} />
               </div>
            </li>
         </ul>
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
      </fieldset>
   );
}
