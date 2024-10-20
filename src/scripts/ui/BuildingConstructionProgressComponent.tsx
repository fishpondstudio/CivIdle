import Tippy from "@tippyjs/react";
import {
   getBuilderCapacity,
   getBuildingPercentage,
   getMultipliersFor,
   isWorldWonder,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { SuspendedInput } from "../../../shared/logic/Tile";
import { formatHMS, formatPercent, sizeOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { WarningComponent } from "./WarningComponent";

export function BuildingConstructionProgressComponent({
   gameState,
   xy,
}: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const { base, multiplier, total } = getBuilderCapacity(building, xy, gameState);
   const { cost, percent, secondsLeft } = getBuildingPercentage(xy, gameState);
   const enabledResourceCount = sizeOf(cost) - building.suspendedInput.size;
   const builderCapacityPerResource = enabledResourceCount > 0 ? total / enabledResourceCount : 0;
   return (
      <fieldset>
         <div className="row">
            <div className="f1">{t(L.ConstructionProgress)}</div>
            <div>{formatPercent(percent, 0)}</div>
         </div>
         <div className="sep5"></div>
         <div className="row">
            <div className="f1">{t(L.EstimatedTimeLeft)}</div>
            <div>{formatHMS(secondsLeft * 1000)}</div>
         </div>
         <div className="sep5"></div>
         <ProgressBarComponent progress={percent} />
         <div className="sep10"></div>
         <div className="table-view">
            <table>
               <tbody>
                  <tr>
                     <th style={{ width: 0 }}></th>
                     <th>{t(L.ConstructionResource)}</th>
                     <th className="text-right">
                        <TextWithHelp content={t(L.TransportAllocatedCapacityTooltip)}>Capacity</TextWithHelp>
                     </th>
                     <th className="text-right">{t(L.ConstructionDelivered)}</th>
                  </tr>
                  {jsxMapOf(cost, (res, value) => {
                     return (
                        <tr key={res}>
                           <td
                              className="pointer"
                              onClick={() => {
                                 if (building.suspendedInput.has(res)) {
                                    building.suspendedInput.delete(res);
                                 } else {
                                    building.suspendedInput.set(res, SuspendedInput.ManualSuspended);
                                 }
                                 notifyGameStateUpdate();
                              }}
                           >
                              <Tippy content={t(L.TransportManualControlTooltip)}>
                                 {(building.suspendedInput.has(res) ?? false) ? (
                                    <div className="m-icon text-red">toggle_off</div>
                                 ) : (
                                    <div className="m-icon text-green">toggle_on</div>
                                 )}
                              </Tippy>
                           </td>
                           <td>{Config.Resource[res].name()}</td>
                           <td className="text-right">
                              {building.suspendedInput.has(res) ? (
                                 0
                              ) : (
                                 <FormatNumber value={builderCapacityPerResource} />
                              )}
                           </td>
                           <td className="text-right">
                              <FormatNumber value={building.resources[res] ?? 0} />/
                              <FormatNumber value={value} />
                              <span className="text-desc ml5">
                                 {formatPercent((building.resources[res] ?? 0) / value)}
                              </span>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>

         <div className="separator"></div>
         {isWorldWonder(building.type) ? (
            <>
               <WarningComponent icon="info" className="text-small">
                  <RenderHTML html={t(L.WonderBuilderCapacityDescHTML)} />
               </WarningComponent>
               <div className="sep10"></div>
            </>
         ) : null}
         <ul className="tree-view">
            <details>
               <summary className="row">
                  <div className="f1">{t(L.ConstructionBuilderCapacity)}</div>
                  <div className="text-strong">
                     <FormatNumber value={total} />
                  </div>
               </summary>
               <ul>
                  <li className="row">
                     <div className="f1">{t(L.ConstructionBuilderBaseCapacity)}</div>
                     <div className="text-strong">
                        <FormatNumber value={base} />
                     </div>
                  </li>
                  <li className="row">
                     <div className="f1">{t(L.ConstructionBuilderMultiplier)}</div>
                     <div className="text-strong">
                        x
                        <FormatNumber value={multiplier} />
                     </div>
                  </li>
                  <ul>
                     {Tick.current.globalMultipliers.builderCapacity.map((value, i) => {
                        return (
                           <li key={i} className="text-small row">
                              <div className="f1">{value.source}</div>
                              <div>{value.value}</div>
                           </li>
                        );
                     })}
                     {getMultipliersFor(xy, gameState).map((value, i) => {
                        if (!value.worker) {
                           return null;
                        }
                        return (
                           <li key={i} className="text-small row">
                              <div className="f1">{value.source}</div>
                              <div>{value.worker}</div>
                           </li>
                        );
                     })}
                  </ul>
               </ul>
            </details>
         </ul>
      </fieldset>
   );
}
