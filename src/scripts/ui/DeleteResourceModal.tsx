import { useState } from "react";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { IBuildingData } from "../../../shared/logic/Tile";
import { clamp, formatNumber, safeAdd, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick, playError } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { WarningComponent } from "./WarningComponent";

export function DeleteResourceModal({
   building,
   resource,
}: { building: IBuildingData; resource: Material }): React.ReactNode {
   const maxAmount = Math.ceil(building.resources[resource] ?? 0);
   const [amount, setAmount] = useState(maxAmount);
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">
               Destroying {Config.Material[resource].name()} from {Config.Building[building.type].name()}
            </div>
         </div>
         <div className="window-body">
            <WarningComponent icon="warning">
               {t(L.ConfirmDestroyResourceContent, {
                  resource: Config.Material[resource].name(),
                  amount: formatNumber(amount),
               })}
            </WarningComponent>
            <div className="sep10" />
            <div className="row">
               <div className="mr10">{t(L.ResourceAmount)}</div>
               <input
                  type="text"
                  className="f1 text-right"
                  value={amount}
                  onChange={(e) => setAmount(clamp(safeParseInt(e.target.value, 0), 0, maxAmount))}
               />
            </div>
            <div className="sep15" />
            <div className="row" style={{ justifyContent: "flex-end" }}>
               <button
                  style={{ width: "80px", fontWeight: "bold" }}
                  disabled={amount <= 0}
                  onClick={() => {
                     if (amount <= 0) {
                        playError();
                        return;
                     }
                     safeAdd(
                        building.resources,
                        resource,
                        -clamp(amount, 0, building.resources[resource] ?? 0),
                     );
                     notifyGameStateUpdate();
                     playClick();
                     hideModal();
                  }}
               >
                  {t(L.ConfirmYes)}
               </button>
               <div style={{ width: "10px" }}></div>
               <button
                  style={{ width: "80px" }}
                  onClick={() => {
                     playClick();
                     hideModal();
                  }}
               >
                  {t(L.ConfirmNo)}
               </button>
            </div>
         </div>
      </div>
   );
}
