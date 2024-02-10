import { useState } from "react";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { getWarehouseCapacity } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import type { IResourceImport, IResourceImportBuildingData } from "../../../shared/logic/Tile";
import { clamp, formatPercent, reduceOf, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

export function ChangeResourceImportModal({
   building,
   resource,
   storage,
}: {
   building: IResourceImportBuildingData;
   resource: Resource;
   storage: number;
}): React.ReactNode {
   const [resourceImport, setResourceImport] = useState<IResourceImport>(
      building.resourceImports[resource] ?? { cap: 0, perCycle: 0 },
   );
   const totalCapacity = getWarehouseCapacity(building);
   const usedCapacity = reduceOf(
      building.resourceImports,
      (prev, res, val) => (res === resource ? prev : prev + val.perCycle),
      0,
   );
   const max = clamp(totalCapacity - usedCapacity, 0, totalCapacity);
   const isValid = resourceImport.perCycle >= 0 && resourceImport.perCycle <= max;
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">
               {t(L.ResourceImportSettings, { res: Config.Resource[resource].name() })}
            </div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <div className="row mv5">
               <div style={{ width: "60px" }}>{t(L.ResourceImportImportPerCycle)}</div>
               <input
                  className="f1 text-right w100"
                  type="text"
                  value={resourceImport.perCycle}
                  onChange={(e) => {
                     setResourceImport({
                        ...resourceImport,
                        perCycle: safeParseInt(e.target.value),
                     });
                  }}
               />
            </div>
            <div className="row text-small">
               <div style={{ width: "60px" }}></div>
               <div className="text-desc">
                  0 ~ <FormatNumber value={max} />
               </div>
               <div className="f1" />
               <div>
                  {[0.25, 0.5, 0.75, 1].map((p) => (
                     <span
                        key={p}
                        className="ml10 text-strong text-link"
                        onClick={() => {
                           setResourceImport({
                              ...resourceImport,
                              perCycle: Math.floor(max * p),
                           });
                        }}
                     >
                        {formatPercent(p)}
                     </span>
                  ))}
               </div>
            </div>
            <div className="sep5"></div>
            <div className="row mv5">
               <div style={{ width: "60px" }}>{t(L.ResourceImportImportCap)}</div>
               <input
                  className="f1 text-right w100"
                  type="text"
                  value={resourceImport.cap}
                  onChange={(e) => {
                     setResourceImport({ ...resourceImport, cap: safeParseInt(e.target.value) });
                  }}
               />
            </div>
            <div className="row text-small">
               <div style={{ width: "60px" }}></div>
               <div className="text-desc">
                  0 ~ <FormatNumber value={storage} />
               </div>
               <div className="f1" />
               <div>
                  {[0.1, 0.25, 0.5, 0.75, 1].map((p) => (
                     <span
                        className="ml10 text-strong text-link"
                        onClick={() => {
                           setResourceImport({
                              ...resourceImport,
                              cap: Math.floor(storage * p),
                           });
                        }}
                     >
                        {formatPercent(p)}
                     </span>
                  ))}
               </div>
            </div>
            <div className="sep10"></div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
               <button
                  className="text-strong"
                  disabled={!isValid}
                  onClick={() => {
                     building.resourceImports[resource] = resourceImport;
                     notifyGameStateUpdate();
                     hideModal();
                  }}
               >
                  {t(L.ChangePlayerHandle)}
               </button>
               <div style={{ width: "10px" }}></div>
               <button onClick={hideModal}>{t(L.ChangePlayerHandleCancel)}</button>
            </div>
         </div>
      </div>
   );
}
