import Tippy from "@tippyjs/react";
import type { Upgrade } from "../../../shared/definitions/UpgradeDefinitions";
import { getBuildingCost, getBuildingDescription } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { GlobalMultiplierNames } from "../../../shared/logic/TickLogic";
import type { IBuildingData } from "../../../shared/logic/Tile";
import { mapOf, numberToRoman } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import { playClick, playError, playUpgrade } from "../visuals/Sound";
import { RenderHTML } from "./RenderHTMLComponent";
import { ResourceAmountComponent } from "./ResourceAmountComponent";

export function UpgradeGroupComponent<T>({
   self,
   upgrades,
   building,
   getSelected,
   setSelected,
}: {
   self: T;
   upgrades: Upgrade[];
   building: IBuildingData;
   getSelected: () => T | null;
   setSelected: (selected: T) => void;
}): React.ReactNode {
   return (
      <div className="table-view">
         <table>
            <tbody>
               {upgrades.map((u, i) => {
                  const unlockable = Config.Upgrade[u];
                  let action: React.ReactNode = null;
                  if ((!getSelected() && i === 0) || (getSelected() && building.level === i)) {
                     action = (
                        <Tippy
                           disabled={!getSelected()}
                           content={mapOf(getBuildingCost(building), (res, amount) => {
                              return (
                                 <ResourceAmountComponent
                                    key={res}
                                    resource={res}
                                    amount={amount}
                                    showLabel={true}
                                    showTooltip={false}
                                 />
                              );
                           })}
                        >
                           <div
                              className="text-link text-strong"
                              onClick={() => {
                                 if (getSelected() && getSelected() !== self) {
                                    playError();
                                    return;
                                 }
                                 playClick();
                                 if (!getSelected()) {
                                    playUpgrade();
                                    setSelected(self);
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
                           {unlockable.unlockBuilding?.map((b) => {
                              return (
                                 <div
                                    key={b}
                                    style={{
                                       border: "1px dashed #ccc",
                                       margin: "5px 0",
                                       padding: 5,
                                    }}
                                 >
                                    <RenderHTML
                                       html={t(L.UnlockXHTML, { name: Config.Building[b].name() })}
                                    />
                                    <div className="text-small text-desc">{getBuildingDescription(b)}</div>
                                 </div>
                              );
                           })}
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
                                    <div className="f1 text-strong">{Config.Building[bld].name()}</div>
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
   );
}
