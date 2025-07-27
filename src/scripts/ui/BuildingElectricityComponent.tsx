import Tippy from "@tippyjs/react";
import classNames from "classnames";
import {
   ElectrificationStatus,
   canBeElectrified,
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

export function BuildingElectricityComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!hasFeature(GameFeature.Electricity, gameState) || !building) {
      return null;
   }
   const hasPower = Tick.current.powerGrid.has(xy);

   let electrification: React.ReactNode = null;
   if (canBeElectrified(building.type)) {
      const status = getElectrificationStatus(xy, gameState);
      electrification = (
         <>
            <div className="separator"></div>
            <div className="row">
               {t(L.ElectrificationStatusV2)}
               <Tippy content={t(L.ElectrificationStatusDesc)}>
                  <div className="m-icon small ml5 text-desc help-cursor">help</div>
               </Tippy>
               <div className="f1"></div>
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
            <div className="sep5" />
            <ul className="tree-view">
               <li className="row">
                  <div className="f1">{t(L.ElectrificationPowerRequired)}</div>
                  <div className="text-strong">
                     <FormatNumber value={getPowerRequired(building)} binary={true} />W
                  </div>
               </li>
               <li className="row">
                  <div className="f1">{t(L.ElectrificationLevel)}</div>
                  <div className="text-strong">
                     <FormatNumber value={building.electrification} />
                  </div>
               </li>
               <li className="row">
                  <div className="f1">{t(L.BuildingLevelBoostFromElectrification)}</div>
                  <div className="text-green text-strong">
                     +
                     <FormatNumber value={Tick.current.electrified.get(xy) ?? 0} />
                  </div>
               </li>
            </ul>
            <div className="sep10"></div>
            <input
               id="building-capacity"
               type="range"
               min="0"
               max={building.level}
               step="1"
               value={building.electrification}
               onChange={(e) => {
                  building.electrification = Number.parseFloat(e.target.value);
                  notifyGameStateUpdate();
               }}
               className="mh0"
            />
            <div className="sep15" />
            <ApplyToAllComponent
               xy={xy}
               getOptions={() => ({ electrification: building.electrification })}
               gameState={gameState}
            />
         </>
      );
   }

   return (
      <fieldset>
         <legend>{t(L.Power)}</legend>
         {Config.Building[building.type].power ? (
            <div className="row text-strong">
               {hasPower ? null : <img src={warning} style={{ margin: "0 2px 0 0" }} />}
               {t(L.RequirePower)}
               <Tippy content={t(L.RequirePowerDesc)}>
                  <div className="m-icon small ml5 text-desc help-cursor">help</div>
               </Tippy>
               <div className="f1"></div>
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
         ) : (
            <div>
               <div>{t(L.NoPowerRequired)}</div>
            </div>
         )}
         {electrification}
      </fieldset>
   );
}
