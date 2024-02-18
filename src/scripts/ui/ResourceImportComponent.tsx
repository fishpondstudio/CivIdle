import classNames from "classnames";
import { useEffect, useState } from "react";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { getStorageFor, getWarehouseCapacity } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import type { IResourceImportBuildingData } from "../../../shared/logic/Tile";
import { forEach } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import type { IBuildingComponentProps } from "./BuildingPage";
import { ChangeResourceImportModal } from "./ChangeResourceImportModal";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { TableView } from "./TableView";

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

   const resources: Set<Resource> = new Set();
   forEach(Tick.current.resourcesByTile, (k, v) => {
      if (!NoPrice[k] && !NoStorage[k]) {
         resources.add(k);
      }
   });
   forEach(building.resources, (k, v) => {
      resources.add(k);
   });
   forEach(building.resourceImports, (k, v) => {
      resources.add(k);
   });
   const storage = getStorageFor(xy, gameState);
   const totalCapacity = getWarehouseCapacity(building);

   return (
      <fieldset>
         <legend>{t(L.ResourceImport)}</legend>
         <TableView
            header={[
               { name: "", sortable: false },
               { name: t(L.ResourceImportResource), sortable: true },
               { name: t(L.ResourceImportStorage), sortable: true },
               { name: t(L.ResourceImportImportPerCycle), sortable: true },
               { name: t(L.ResourceImportImportCap), sortable: true },
               { name: "", sortable: false },
            ]}
            data={Array.from(resources)}
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
                     <td>{Config.Resource[res].name()}</td>
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
                                 capacity={totalCapacity}
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
                  const amount = totalCapacity / selected.size;
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
      </fieldset>
   );
}
