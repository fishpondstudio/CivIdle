import Tippy from "@tippyjs/react";
import type React from "react";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { getBuildingCost, getMultipliersFor, totalMultiplierFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { compareResources } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import type { ISwissBankBuildingData } from "../../../shared/logic/Tile";
import { formatNumber, keysOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { jsxMapOf } from "../utilities/Helper";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { ResourceAmountComponent } from "./ResourceAmountComponent";

export function SwissBankBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as ISwissBankBuildingData;
   const gameOptions = useGameOptions();
   if (!building) {
      return null;
   }
   const multiplier = totalMultiplierFor(xy, "output", 1, false, gameState);
   return (
      <div className="window-body">
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.WonderUpgradeLevel)}</div>
               <div className="text-strong">{building.level}</div>
            </div>
            <div className="separator" />
            {jsxMapOf(getBuildingCost({ type: building.type, level: building.level }), (res, amount) => {
               return (
                  <div key={res} className="row">
                     <div className="f1 text-strong">{Config.Resource[res].name()}</div>
                     <div>
                        <ResourceAmountComponent
                           className="text-strong"
                           resource={res}
                           amount={amount}
                           showLabel={false}
                           showTooltip={true}
                        />
                     </div>
                  </div>
               );
            })}
            <div className="separator" />
            <button
               className="jcc w100 row"
               onClick={() => {
                  playClick();
                  building.desiredLevel = building.level + 1;
                  building.status = "upgrading";
                  notifyGameStateUpdate();
               }}
            >
               <div className="m-icon small">assistant_navigation</div>
               <div className="text-strong f1">{t(L.Upgrade)}</div>
            </button>
         </fieldset>
         <fieldset>
            <select
               className="w100"
               value={building.resource ?? ""}
               onChange={(e) => {
                  const val = e.target.value;
                  if (!val || val in NoPrice || val in NoStorage || val === "Koti") {
                     building.resource = null;
                  } else {
                     building.resource = val as Resource;
                  }
                  notifyGameStateUpdate();
               }}
            >
               <option value=""></option>
               {keysOf(Config.Resource)
                  .sort((a, b) => compareResources(a, b, gameOptions.resourceSortMethod))
                  .map((res) => {
                     if (NoPrice[res] || NoStorage[res] || res === "Koti") {
                        return null;
                     }
                     return (
                        <option key={res} value={res}>
                           {Config.Resource[res].name()}
                        </option>
                     );
                  })}
            </select>
            <div className="separator" />
            <ul className="tree-view">
               <li>
                  <div className="text-strong">{t(L.ActualConsumptionPerCycle)}</div>
                  <ul>
                     {Tick.current.additionalConsumptions.map(({ xy: xy_, res, amount }) => {
                        if (xy !== xy_) {
                           return null;
                        }
                        return (
                           <li key={res} className="row">
                              <div className="f1">{Config.Resource[res].name()}</div>
                              <div className="text-strong">{formatNumber(amount)}</div>
                           </li>
                        );
                     })}
                  </ul>
               </li>
               <li>
                  <div className="text-strong">{t(L.ActualProductionPerCycle)}</div>
                  <ul>
                     {Tick.current.additionalProductions.map(({ xy: xy_, res, amount }) => {
                        if (xy !== xy_) {
                           return null;
                        }
                        return (
                           <li key={res} className="row">
                              <div className="f1">{Config.Resource[res].name()}</div>
                              <div className="text-strong">{formatNumber(amount)}</div>
                           </li>
                        );
                     })}
                  </ul>
               </li>
               <li>
                  <div className="row">
                     <div className="text-strong f1">{t(L.KotiProduction)}</div>
                     <div className="text-strong">{formatNumber(building.level * multiplier)}</div>
                  </div>
                  <ul>
                     <li className="row">
                        <div className="f1">{t(L.BaseProduction)}</div>
                        <div>{formatNumber(building.level)}</div>
                     </li>
                     <li className="row">
                        <div className="f1">{t(L.ProductionMultiplier)}</div>
                        <div>x{multiplier}</div>
                     </li>
                     <ul className="text-small">
                        <li className="row">
                           <div className="f1">{t(L.BaseMultiplier)}</div>
                           <div>1</div>
                        </li>
                        {getMultipliersFor(xy, gameState).map((m, idx) => {
                           if (!m.output) {
                              return null;
                           }
                           return (
                              <li key={idx} className="row">
                                 <div>{m.source}</div>
                                 {m.unstable ? (
                                    <Tippy content={t(L.DynamicMultiplierTooltip)}>
                                       <div className="m-icon small ml5 text-desc">whatshot</div>
                                    </Tippy>
                                 ) : null}
                                 <div className="f1 text-right">{m.output}</div>
                              </li>
                           );
                        })}
                     </ul>
                  </ul>
               </li>
               <li className="row">
                  <div className="text-strong f1">{t(L.KotiInStorage)}</div>
                  <div className="text-strong">{formatNumber(building.resources.Koti ?? 0)}</div>
               </li>
            </ul>
         </fieldset>
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
