import Tippy from "@tippyjs/react";
import classNames from "classnames";
import {
   IOFlags,
   getElectrificationBoost,
   getMultipliersFor,
   totalMultiplierFor,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { getBuildingIO } from "../../../shared/logic/IntraTickCache";
import type { Multiplier } from "../../../shared/logic/TickLogic";
import { NotProducingReason, Tick } from "../../../shared/logic/TickLogic";
import type { Tile } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import warning from "../../images/warning.png";
import { jsxMapOf } from "../utilities/Helper";
import { FormatNumber } from "./HelperComponents";
import { TextWithHelp } from "./TextWithHelpComponent";

export function BuildingIOTreeViewComponent({
   gameState,
   xy,
   type,
}: {
   gameState: GameState;
   xy: Tile;
   type: keyof Pick<Multiplier, "input" | "output">;
}): React.ReactNode {
   const data = getBuildingIO(xy, type, IOFlags.Multiplier | IOFlags.Capacity, gameState);
   const totalMultiplier = totalMultiplierFor(xy, type, 1, false, gameState);
   const building = gameState.tiles.get(xy)?.building;
   const buildingType = building?.type;
   const isCloneOutput =
      type === "output" && (buildingType === "CloneFactory" || buildingType === "CloneLab");
   return (
      <ul className="tree-view">
         {jsxMapOf(data, (k, v) => {
            const resourceInStorage = gameState.tiles.get(xy)?.building?.resources[k] ?? 0;
            const showWarning =
               type === "input" &&
               Tick.current.notProducingReasons.get(xy) === NotProducingReason.NotEnoughResources &&
               resourceInStorage < v;
            const levelBoost = Tick.current.levelBoost.get(xy) ?? 0;
            return (
               <li key={k}>
                  <details>
                     <summary className="row">
                        {showWarning ? <img src={warning} style={{ margin: "0 2px 0 0" }} /> : null}
                        <div className={classNames({ f1: true, "production-warning": showWarning })}>
                           {Config.Resource[k].name()}
                        </div>
                        <div className="text-strong">
                           <FormatNumber value={v} />
                        </div>
                     </summary>
                     <ul>
                        {isCloneOutput ? (
                           <li className="row text-strong">
                              <TextWithHelp content={t(L.ResourceCloneTooltip)}>
                                 <div>{t(L.InputResourceForCloning)}</div>
                              </TextWithHelp>
                              <div className="f1 text-right">
                                 <FormatNumber value={v / (1 + totalMultiplier)} />
                              </div>
                           </li>
                        ) : null}
                        <li className="row">
                           <div className="f1">
                              {type === "input" ? t(L.BaseConsumption) : t(L.BaseProduction)}
                           </div>
                           <div className="text-strong">
                              <FormatNumber
                                 value={isCloneOutput ? v / (1 + totalMultiplier) : v / totalMultiplier}
                              />
                           </div>
                        </li>
                        <ul className="text-small">
                           <li className="row">
                              <div className="f1">{t(L.BuildingLevel)}</div>
                              <FormatNumber value={building?.level ?? 0} />
                           </li>
                           {building && getElectrificationBoost(building, gameState) > 0 ? (
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
                           <div className="f1">
                              {type === "input" ? t(L.ConsumptionMultiplier) : t(L.ProductionMultiplier)}
                           </div>
                           <div className="text-strong">
                              x
                              <FormatNumber value={totalMultiplier} />
                           </div>
                        </li>
                        <ul className="text-small">
                           <li className="row">
                              <div className="f1">{t(L.BaseMultiplier)}</div>
                              <div>1</div>
                           </li>
                           {getMultipliersFor(xy, gameState).map((m, idx) => {
                              if (!m[type]) {
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
                                    <div className="f1 text-right">{m[type]}</div>
                                 </li>
                              );
                           })}
                        </ul>
                     </ul>
                  </details>
               </li>
            );
         })}
      </ul>
   );
}
