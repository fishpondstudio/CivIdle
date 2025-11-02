import Tippy from "@tippyjs/react";
import type React from "react";
import { getEastIndiaCompanyUpgradeCost } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { EAST_INDIA_COMPANY_BOOST_PER_EV } from "../../../shared/logic/Constants";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { formatNumber, safeAdd } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick, playError } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";

export function EastIndiaCompanyBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <fieldset>
            <div className="row mv5">
               <div className="f1">{t(L.TradeValue)}</div>
               <div className="text-strong">
                  <FormatNumber value={building.resources.TradeValue ?? 0} />
               </div>
            </div>
            <div className="row mv5">
               <div className="f1">{t(L.BoostCyclesLeft)}</div>
               <div className="text-strong">
                  <FormatNumber
                     value={Math.floor(
                        (building.resources.TradeValue ?? 0) / EAST_INDIA_COMPANY_BOOST_PER_EV,
                     )}
                  />
               </div>
            </div>
            <div className="separator" />
            <div className="row mv5">
               <div className="f1">{t(L.Level)}</div>
               <div className="text-strong">{building.level}</div>
            </div>
            <button
               className="jcc w100 row mt10"
               disabled={
                  (building.resources.TradeValue ?? 0) < getEastIndiaCompanyUpgradeCost(building.level + 1)
               }
               onClick={() => {
                  const cost = getEastIndiaCompanyUpgradeCost(building.level + 1);
                  if ((building.resources.TradeValue ?? 0) < cost) {
                     playError();
                     return;
                  }
                  safeAdd(building.resources, "TradeValue", -cost);
                  building.level++;
                  playClick();
                  notifyGameStateUpdate();
               }}
            >
               <div className="m-icon small">assistant_navigation</div>
               <Tippy
                  content={
                     <span
                        className={
                           (building.resources.TradeValue ?? 0) <
                           getEastIndiaCompanyUpgradeCost(building.level + 1)
                              ? "text-red"
                              : ""
                        }
                     >
                        {Config.Material.TradeValue.name()}
                        {": "}
                        {formatNumber(getEastIndiaCompanyUpgradeCost(building.level + 1))}
                     </span>
                  }
               >
                  <div className="text-strong f1">{t(L.Upgrade)}</div>
               </Tippy>
            </button>
         </fieldset>
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
