import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useState } from "react";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import { Config } from "../../../shared/logic/Config";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import {
   BuildingInputModeNames,
   BuildingInputModeTooltips,
   type IResourceImport,
   type IResourceImportBuildingData,
} from "../../../shared/logic/Tile";
import {
   clamp,
   formatPercent,
   isNullOrUndefined,
   reduceOf,
   safeParseInt,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { jsxMMapOf } from "../utilities/Helper";
import { playError } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

const LABEL_WIDTH = 150;

export function ChangeResourceImportModal({
   building,
   resource,
   storage,
   capacity,
}: {
   building: IResourceImportBuildingData;
   resource: Material;
   storage: number;
   capacity: number;
}): React.ReactNode {
   const [resourceImport, setResourceImport] = useState<IResourceImport>(
      building.resourceImports[resource] ?? { cap: 0, perCycle: 0 },
   );
   const gs = useGameState();
   const usedCapacity = reduceOf(
      building.resourceImports,
      (prev, res, val) => (res === resource ? prev : prev + val.perCycle),
      0,
   );
   const max = clamp(capacity - usedCapacity, 0, capacity);
   const isValid = resourceImport.perCycle >= 0 && resourceImport.perCycle <= max;
   return (
      <div className="window" style={{ width: "450px" }}>
         <div className="title-bar">
            <div className="title-bar-text">
               {t(L.ResourceImportSettings, { res: Config.Material[resource].name() })}
            </div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <div className="row mv5">
               <div className="row" style={{ width: LABEL_WIDTH }}>
                  <div>{t(L.ResourceImportImportPerCycleV2)}</div>
                  <Tippy content={t(L.ResourceImportImportPerCycleV2ToolTip)}>
                     <div className="m-icon small ml5 text-desc">help</div>
                  </Tippy>
               </div>
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
               <div style={{ width: LABEL_WIDTH }}></div>
               <div className="text-desc">
                  0 ~ <FormatNumber value={max} />
               </div>
               <div className="f1" />
               <div>
                  {[0, 0.25, 0.5, 0.75, 1].map((p) => (
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
               <div className="row" style={{ width: LABEL_WIDTH }}>
                  <div>{t(L.ResourceImportImportCapV2)}</div>
                  <Tippy content={t(L.ResourceImportImportCapV2Tooltip)}>
                     <div className="m-icon small ml5 text-desc">help</div>
                  </Tippy>
               </div>
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
               <div style={{ width: LABEL_WIDTH }}></div>
               <div className="text-desc">
                  0 ~ <FormatNumber value={storage} />
               </div>
               <div className="f1" />
               <div>
                  {[0, 0.1, 0.25, 0.5, 0.75, 1].map((p) => (
                     <span
                        key={p}
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
            {hasFeature(GameFeature.BuildingInputMode, gs) ? (
               <fieldset className="mb10">
                  <legend>{t(L.ResourceTransportPreference)}</legend>
                  <div className="row mv5">
                     <Tippy content={t(L.TechResourceTransportPreferenceDefaultTooltip)}>
                        <button
                           onClick={() => {
                              delete resourceImport.inputMode;
                              setResourceImport({
                                 ...resourceImport,
                              });
                           }}
                           className={classNames({
                              f1: true,
                              active: isNullOrUndefined(resourceImport.inputMode),
                              "text-desc": !isNullOrUndefined(resourceImport.inputMode),
                           })}
                        >
                           {t(L.TechResourceTransportPreferenceDefault)}
                        </button>
                     </Tippy>
                     {jsxMMapOf(BuildingInputModeNames, (mode, name) => {
                        return (
                           <Tippy key={mode} content={BuildingInputModeTooltips.get(mode)?.() ?? ""}>
                              <button
                                 onClick={() => {
                                    setResourceImport({
                                       ...resourceImport,
                                       inputMode: mode,
                                    });
                                    notifyGameStateUpdate();
                                 }}
                                 className={classNames({
                                    f1: true,
                                    active: resourceImport.inputMode === mode,
                                    "text-desc": resourceImport.inputMode !== mode,
                                 })}
                              >
                                 {name()}
                              </button>
                           </Tippy>
                        );
                     })}
                  </div>
               </fieldset>
            ) : null}
            <div className="row" style={{ justifyContent: "flex-end" }}>
               <button
                  className="text-strong"
                  disabled={!isValid}
                  onClick={() => {
                     if (!isValid) {
                        playError();
                        return;
                     }
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
