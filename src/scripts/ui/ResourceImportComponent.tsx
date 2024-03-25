import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import {
   getMultipliersFor,
   getResourceImportCapacity,
   getStorageFor,
   totalMultiplierFor,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { unlockedResources } from "../../../shared/logic/IntraTickCache";
import {
   BuildingInputModeNames,
   ResourceImportOptions,
   type IResourceImportBuildingData,
} from "../../../shared/logic/Tile";
import {
   copyFlag,
   forEach,
   hasFlag,
   isNullOrUndefined,
   keysOf,
   toggleFlag,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { ChangeResourceImportModal } from "./ChangeResourceImportModal";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { TableView } from "./TableView";

const resourceImportSortingState = { column: 1, asc: true };

export function ResourceImportComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IResourceImportBuildingData;
   const [selected, setSelected] = useState(new Set<Resource>());
   // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
   useEffect(() => setSelected(new Set()), [xy]);
   if (!building) {
      return null;
   }

   if (!building.resourceImports) {
      building.resourceImports = {};
   }

   const storage = getStorageFor(xy, gameState);
   const baseCapacity = getResourceImportCapacity(building, 1);
   const capacityMultiplier = totalMultiplierFor(xy, "output", 1, false, gameState);
   const resources = keysOf(unlockedResources(gameState)).filter((r) => !NoStorage[r] && !NoPrice[r]);

   return (
      <fieldset>
         <legend>{t(L.ResourceImport)}</legend>
         <TableView
            header={[
               { name: "", sortable: false },
               { name: t(L.ResourceImportResource), sortable: true },
               { name: t(L.ResourceImportStorage), sortable: true, right: true },
               { name: t(L.ResourceImportImportPerCycleV2), sortable: true, right: true },
               { name: t(L.ResourceImportImportCapV2), sortable: true, right: true },
               { name: "", sortable: false },
            ]}
            sortingState={resourceImportSortingState}
            data={resources}
            compareFunc={(a, b, col) => {
               switch (col) {
                  case 2:
                     return (building.resources[a] ?? 0) - (building.resources[b] ?? 0);
                  case 3:
                     return (
                        (building.resourceImports[a]?.perCycle ?? 0) -
                        (building.resourceImports[b]?.perCycle ?? 0)
                     );
                  case 4:
                     return (building.resourceImports[a]?.cap ?? 0) - (building.resourceImports[b]?.cap ?? 0);
                  default:
                     return Config.Resource[a].name().localeCompare(Config.Resource[b].name());
               }
            }}
            renderRow={(res) => {
               const ri = building.resourceImports[res];
               return (
                  <tr key={res}>
                     <td
                        onClick={() => {
                           if (selected.has(res)) {
                              selected.delete(res);
                           } else {
                              selected.add(res);
                           }
                           setSelected(new Set(selected));
                        }}
                     >
                        {selected.has(res) ? (
                           <div className="m-icon small text-blue">check_box</div>
                        ) : (
                           <div className="m-icon small text-desc">check_box_outline_blank</div>
                        )}
                     </td>
                     <td className="row">
                        <div>{Config.Resource[res].name()}</div>
                        {isNullOrUndefined(ri?.inputMode) ? null : (
                           <Tippy
                              content={t(L.TechResourceTransportPreferenceOverrideTooltip, {
                                 mode: BuildingInputModeNames.get(ri.inputMode)!(),
                              })}
                           >
                              <div className="m-icon text-orange small ml5">local_shipping</div>
                           </Tippy>
                        )}
                     </td>
                     <td className="text-right">
                        <FormatNumber value={building.resources[res] ?? 0} />
                     </td>
                     <td className="text-right" onWheel={(e) => {}}>
                        <FormatNumber value={ri?.perCycle ?? 0} />
                     </td>
                     <td className="text-right">
                        <FormatNumber value={ri?.cap ?? 0} />
                     </td>
                     <td
                        className="text-right"
                        onClick={() =>
                           showModal(
                              <ChangeResourceImportModal
                                 storage={storage.total}
                                 capacity={baseCapacity * capacityMultiplier}
                                 building={building}
                                 resource={res}
                              />,
                           )
                        }
                     >
                        <div className="m-icon small pointer text-link">settings</div>
                     </td>
                  </tr>
               );
            }}
         />
         <div className="sep10" />
         <div className="row text-small">
            <div className={classNames({ "text-desc": selected.size === 0 })}>
               {t(L.SelectedCount, { count: selected.size })}
            </div>
            <div className="f1"></div>
            <div className="text-link mr10" onClick={() => setSelected(new Set(resources))}>
               {t(L.SelectedAll)}
            </div>
            <div
               className="text-link mr10"
               onClick={() => {
                  const newSet = new Set<Resource>();
                  resources.forEach((r) => {
                     if (!selected.has(r)) {
                        newSet.add(r);
                     }
                     setSelected(newSet);
                  });
               }}
            >
               {t(L.InverseSelection)}
            </div>
            <div className="text-link" onClick={() => setSelected(new Set())}>
               {t(L.ClearSelection)}
            </div>
         </div>
         <div className="sep5"></div>
         <div className="row text-small">
            <div className="text-desc">{t(L.RedistributeAmongSelected)}</div>
            <div className="f1"></div>
            <div
               className="text-link mr10"
               onClick={() => {
                  forEach(building.resourceImports, (res, v) => {
                     v.perCycle = 0;
                  });
                  const amount = Math.floor((baseCapacity * capacityMultiplier) / selected.size);
                  selected.forEach((res) => {
                     if (building.resourceImports[res]) {
                        building.resourceImports[res]!.perCycle = amount;
                     } else {
                        building.resourceImports[res] = { perCycle: amount, cap: 0 };
                     }
                  });
                  notifyGameStateUpdate();
               }}
            >
               {t(L.RedistributeAmongSelectedImport)}
            </div>
            <div
               className="text-link"
               onClick={() => {
                  forEach(building.resourceImports, (res, v) => {
                     v.cap = 0;
                  });
                  const amount = storage.total / selected.size;
                  selected.forEach((res) => {
                     if (building.resourceImports[res]) {
                        building.resourceImports[res]!.cap = amount;
                     } else {
                        building.resourceImports[res] = { perCycle: 0, cap: amount };
                     }
                  });
                  notifyGameStateUpdate();
               }}
            >
               {t(L.RedistributeAmongSelectedCap)}
            </div>
         </div>
         <div className="sep5"></div>
         <div className="row text-small">
            <div className="text-desc">{t(L.ClearSelected)}</div>
            <div className="f1"></div>
            <div
               className="text-link mr10"
               onClick={() => {
                  forEach(building.resourceImports, (res, v) => {
                     if (selected.has(res)) {
                        v.perCycle = 0;
                     }
                  });
                  notifyGameStateUpdate();
               }}
            >
               {t(L.RedistributeAmongSelectedImport)}
            </div>
            <div
               className="text-link"
               onClick={() => {
                  forEach(building.resourceImports, (res, v) => {
                     if (selected.has(res)) {
                        v.cap = 0;
                     }
                  });
                  notifyGameStateUpdate();
               }}
            >
               {t(L.RedistributeAmongSelectedCap)}
            </div>
         </div>
         <div className="separator"></div>
         <ul className="tree-view">
            <li>
               <details>
                  <summary className="row">
                     <div className="f1">{t(L.ResourceImportCapacity)}</div>
                     <div className="text-strong">
                        <FormatNumber value={baseCapacity * capacityMultiplier} />
                     </div>
                  </summary>
                  <ul>
                     <li className="row">
                        <div className="f1">Base Capacity</div>
                        <div className="text-strong">
                           <FormatNumber value={baseCapacity} />
                        </div>
                     </li>
                     <li className="row">
                        <div className="f1">{t(L.ProductionMultiplier)}</div>
                        <div className="text-strong">
                           <FormatNumber value={capacityMultiplier} />
                        </div>
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
                                 <div className="f1">{m.source}</div>
                                 <div>{m.output}</div>
                              </li>
                           );
                        })}
                     </ul>
                  </ul>
               </details>
            </li>
         </ul>
         <div className="separator" />
         <div className="row">
            <div>{t(L.ResourceExportBelowCap)}</div>
            <Tippy content={t(L.ResourceExportBelowCapTooltip)}>
               <div className="m-icon small ml5 text-desc help-cursor">help</div>
            </Tippy>
            <div className="f1"></div>
            <div
               className="pointer ml20"
               onClick={() => {
                  playClick();
                  building.resourceImportOptions = toggleFlag(
                     building.resourceImportOptions,
                     ResourceImportOptions.ExportBelowCap,
                  );
                  notifyGameStateUpdate();
               }}
            >
               {hasFlag(building.resourceImportOptions, ResourceImportOptions.ExportBelowCap) ? (
                  <div className="m-icon text-green">toggle_on</div>
               ) : (
                  <div className="m-icon text-desc">toggle_off</div>
               )}
            </div>
         </div>
         <ApplyToAllComponent
            building={building}
            getOptions={(s) => ({
               resourceImportOptions: copyFlag(
                  building.resourceImportOptions,
                  (s as IResourceImportBuildingData).resourceImportOptions,
                  ResourceImportOptions.ExportBelowCap,
               ),
            })}
            gameState={gameState}
         />
         <div className="separator"></div>
         <div className="row">
            <div>{t(L.ResourceExportToSameType)}</div>
            <Tippy content={t(L.ResourceExportToSameTypeTooltip)}>
               <div className="m-icon small ml5 text-desc help-cursor">help</div>
            </Tippy>
            <div className="f1"></div>
            <div
               className="pointer ml20"
               onClick={() => {
                  playClick();
                  building.resourceImportOptions = toggleFlag(
                     building.resourceImportOptions,
                     ResourceImportOptions.ExportToSameType,
                  );
                  notifyGameStateUpdate();
               }}
            >
               {hasFlag(building.resourceImportOptions, ResourceImportOptions.ExportToSameType) ? (
                  <div className="m-icon text-green">toggle_on</div>
               ) : (
                  <div className="m-icon text-desc">toggle_off</div>
               )}
            </div>
         </div>
         <ApplyToAllComponent
            building={building}
            getOptions={(s) => ({
               resourceImportOptions: copyFlag(
                  building.resourceImportOptions,
                  (s as IResourceImportBuildingData).resourceImportOptions,
                  ResourceImportOptions.ExportToSameType,
               ),
            })}
            gameState={gameState}
         />
      </fieldset>
   );
}
