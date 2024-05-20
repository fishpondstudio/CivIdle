import Tippy from "@tippyjs/react";
import { getBuildingCost } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { GlobalMultiplierNames } from "../../../shared/logic/TickLogic";
import type { ITraditionBuildingData } from "../../../shared/logic/Tile";
import { formatNumber, mapOf, numberToRoman } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import { playClick, playError, playUpgrade } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function TraditionBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as ITraditionBuildingData;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         {!building.tradition ? (
            <WarningComponent icon="info" className="text-small mb10">
               <RenderHTML html={t(L.TraditionDescHTML)} />
            </WarningComponent>
         ) : null}
         {jsxMapOf(Config.Tradition, (tradition, def) => {
            if (building.tradition && building.tradition !== tradition) {
               return null;
            }
            return (
               <fieldset key={tradition}>
                  <legend>{def.name()}</legend>
                  <div className="table-view">
                     <table>
                        <tbody>
                           {def.content.map((u, i) => {
                              const unlockable = Config.Upgrade[u];
                              let action: React.ReactNode = null;
                              if (building.tradition && building.tradition !== tradition) {
                                 action = <div className="m-icon small text-desc">lock</div>;
                              } else if (
                                 (!building.tradition && i === 0) ||
                                 (building.tradition && building.level === i)
                              ) {
                                 action = (
                                    <Tippy
                                       disabled={!building.tradition}
                                       content={mapOf(getBuildingCost(building), (res, amount) => {
                                          return `${Config.Resource[res].name()} ${formatNumber(amount)}`;
                                       }).join(", ")}
                                    >
                                       <div
                                          className="text-link text-strong"
                                          onClick={() => {
                                             if (building.tradition && building.tradition !== tradition) {
                                                playError();
                                                return;
                                             }
                                             playClick();
                                             if (!building.tradition) {
                                                playUpgrade();
                                                building.tradition = tradition;
                                             } else {
                                                building.desiredLevel++;
                                                building.status = "upgrading";
                                             }
                                             notifyGameStateUpdate();
                                          }}
                                       >
                                          {t(L.UnlockBuilding)}
                                       </div>
                                    </Tippy>
                                 );
                              } else if (building.level > i) {
                                 action = <div className="m-icon small text-green">check_circle</div>;
                              } else {
                                 action = <div className="m-icon small text-desc">lock</div>;
                              }

                              return (
                                 <tr key={u}>
                                    <td className="text-strong">{numberToRoman(i + 1)}</td>
                                    <td>
                                       {jsxMapOf(unlockable.buildingMultiplier, (bld, mul) => {
                                          return (
                                             <div
                                                key={bld}
                                                className="row"
                                                style={{
                                                   border: "1px dashed #ccc",
                                                   margin: "5px 0",
                                                   padding: 5,
                                                }}
                                             >
                                                <div className="f1 text-strong">
                                                   {Config.Building[bld].name()}
                                                </div>
                                                {mul.input ? (
                                                   <div className="ml20 text-small">
                                                      +{mul.input} {t(L.ConsumptionMultiplier)}
                                                   </div>
                                                ) : null}
                                                {mul.output ? (
                                                   <div className="ml20 text-small">
                                                      +{mul.output} {t(L.ProductionMultiplier)}
                                                   </div>
                                                ) : null}
                                                {mul.worker ? (
                                                   <div className="ml20 text-small">
                                                      +{mul.storage} {t(L.WorkerCapacityMultiplier)}
                                                   </div>
                                                ) : null}
                                                {mul.storage ? (
                                                   <div className="ml20 text-small">
                                                      +{mul.storage} {t(L.StorageMultiplier)}
                                                   </div>
                                                ) : null}
                                             </div>
                                          );
                                       })}
                                       {jsxMapOf(unlockable.globalMultiplier, (k, v) => {
                                          return (
                                             <div
                                                key={k}
                                                className="row"
                                                style={{
                                                   border: "1px dashed #ccc",
                                                   margin: "5px 0",
                                                   padding: 5,
                                                }}
                                             >
                                                <div className="f1">{GlobalMultiplierNames[k]()}</div>
                                                <div className="text-strong">+{v}</div>
                                             </div>
                                          );
                                       })}
                                       {unlockable.additionalUpgrades?.().map((v, i) => {
                                          return (
                                             <RenderHTML
                                                key={i}
                                                style={{
                                                   border: "1px dashed #ccc",
                                                   margin: "5px 0",
                                                   padding: 5,
                                                }}
                                                html={v}
                                             />
                                          );
                                       })}
                                    </td>
                                    <td className="text-center">{action}</td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </fieldset>
            );
         })}
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
