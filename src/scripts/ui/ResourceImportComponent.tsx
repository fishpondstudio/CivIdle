import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { getStorageFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { Tick } from "../../../shared/logic/TickLogic";
import type { IResourceImportBuildingData } from "../../../shared/logic/Tile";
import { forEach, keysOf } from "../../../shared/utilities/Helper";
import type { PartialSet } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import type { IBuildingComponentProps } from "./BuildingPage";
import { ChangeResourceImportModal } from "./ChangeResourceImportModal";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { TableView } from "./TableView";

export function ResourceImportComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as IResourceImportBuildingData;
   if (!building) {
      return null;
   }

   if (!building.resourceImports) {
      building.resourceImports = {};
   }

   const resources: PartialSet<Resource> = {};
   forEach(Tick.current.resourcesByTile, (k, v) => {
      if (Config.Resource[k].canPrice && Config.Resource[k].canStore) {
         resources[k] = true;
      }
   });
   forEach(building.resources, (k, v) => {
      resources[k] = true;
   });
   forEach(building.resourceImports, (k, v) => {
      resources[k] = true;
   });
   const storage = getStorageFor(xy, gameState);

   return (
      <fieldset>
         <legend>{t(L.ResourceImport)}</legend>
         <TableView
            header={[
               { name: t(L.ResourceImportResource), sortable: true },
               { name: t(L.ResourceImportStorage), sortable: true },
               { name: t(L.ResourceImportImportPerCycle), sortable: true },
               { name: t(L.ResourceImportImportCap), sortable: true },
               { name: "", sortable: false },
            ]}
            data={keysOf(resources)}
            compareFunc={(a, b, col) => {
               switch (col) {
                  case 0:
                     return Config.Resource[a].name().localeCompare(Config.Resource[b].name());
                  case 1:
                     return (building.resources[a] ?? 0) - (building.resources[b] ?? 0);
                  case 2:
                     return (
                        (building.resourceImports[a]?.perCycle ?? 0) -
                        (building.resourceImports[b]?.perCycle ?? 0)
                     );
                  case 3:
                     return (building.resourceImports[a]?.cap ?? 0) - (building.resourceImports[b]?.cap ?? 0);
                  default:
                     return 0;
               }
            }}
            renderRow={(res) => {
               const ri = building.resourceImports[res];
               return (
                  <tr key={res}>
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
      </fieldset>
   );
}
