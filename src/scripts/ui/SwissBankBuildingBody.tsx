import Tippy from "@tippyjs/react";
import type React from "react";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { getMultipliersFor, totalMultiplierFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { combineResources } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { SwissBankFlags, type ISwissBankBuildingData } from "../../../shared/logic/Tile";
import { formatNumber, hasFlag, keysOf, toggleFlag } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import { BuildingElectricityComponent } from "./BuildingElectricityComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";
import { UpgradeableWonderComponent } from "./UpgradeableWonderComponent";

export function SwissBankBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as ISwissBankBuildingData;
   if (!building) {
      return null;
   }
   const multiplier = totalMultiplierFor(xy, "output", 1, false, gameState);
   const availableResources = combineResources(
      Array.from(Tick.current.playerTradeBuildings.values()).map((m) => m.resources),
   );
   const levelBoost = Tick.current.levelBoost.get(xy) ?? [];
   const electrification = Tick.current.electrified.get(xy) ?? 0;
   const effectiveLevel =
      building.level + electrification + levelBoost.reduce((acc, lb) => acc + lb.value, 0);
   return (
      <div className="window-body">
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
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
                  .sort((a, b) => Config.Resource[a].name().localeCompare(Config.Resource[b].name()))
                  .map((res) => {
                     if (NoPrice[res] || NoStorage[res] || res === "Koti") {
                        return null;
                     }
                     return (
                        <option key={res} value={res}>
                           {Config.Resource[res].name()} ({formatNumber(availableResources[res] ?? 0)})
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
                     <div className="text-strong">{formatNumber(effectiveLevel * multiplier)}</div>
                  </div>
                  <ul>
                     <li className="row">
                        <div className="f1">{t(L.BaseProduction)}</div>
                        <div>{formatNumber(effectiveLevel)}</div>
                     </li>
                     <ul>
                        <li className="row">
                           <div className="f1">{t(L.BuildingLevel)}</div>
                           <div>{formatNumber(building.level)}</div>
                        </li>
                        {electrification > 0 ? (
                           <li className="row">
                              <div className="f1">{t(L.ElectrificationLevel)}</div>
                              <FormatNumber value={Tick.current.electrified.get(xy) ?? 0} />
                           </li>
                        ) : null}
                        {levelBoost && levelBoost.length > 0
                           ? levelBoost.map((lb, idx) => (
                                <li key={idx} className="row">
                                   <div className="f1">{lb.source}</div>
                                   <FormatNumber value={lb.value} />
                                </li>
                             ))
                           : null}
                     </ul>
                     <li className="row">
                        <div className="f1">{t(L.ProductionMultiplier)}</div>
                        <div>x{multiplier}</div>
                     </li>
                     <ul className="text-small">
                        <li className="row">
                           <div className="f1">{t(L.BaseMultiplier)}</div>
                           <div>1</div>
                        </li>
                        {getMultipliersFor(xy, false, gameState).map((m, idx) => {
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
         <fieldset>
            <div className="row">
               <div>{t(L.NoKotiExport)}</div>
               <Tippy content={t(L.NoKotiExportDesc)}>
                  <div className="m-icon small ml5 text-desc help-cursor">help</div>
               </Tippy>
               <div className="f1"></div>
               <div
                  className="pointer ml20"
                  onClick={() => {
                     playClick();
                     building.flags = toggleFlag(building.flags, SwissBankFlags.NoExport);
                     notifyGameStateUpdate();
                  }}
               >
                  {hasFlag(building.flags, SwissBankFlags.NoExport) ? (
                     <div className="m-icon text-green">toggle_on</div>
                  ) : (
                     <div className="m-icon text-desc">toggle_off</div>
                  )}
               </div>
            </div>
         </fieldset>
         <BuildingElectricityComponent gameState={gameState} xy={xy} />
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
