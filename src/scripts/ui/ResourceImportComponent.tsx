import { Resource } from "../definitions/ResourceDefinitions";
import { PartialSet } from "../definitions/TypeDefinitions";
import { getStorageFor } from "../logic/BuildingLogic";
import { Tick } from "../logic/TickLogic";
import { IResourceImportBuildingData } from "../logic/Tile";
import { forEach, keysOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { IBuildingComponentProps } from "./BuildingPage";
import { ChangeResourceImportModal } from "./ChangeResourceImportModal";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";

export function ResourceImportComponent({ gameState, xy }: IBuildingComponentProps) {
   const building = gameState.tiles[xy]?.building as IResourceImportBuildingData;
   if (!building) {
      return null;
   }

   if (!building.resourceImports) {
      building.resourceImports = {};
   }

   const resources: PartialSet<Resource> = {};
   forEach(Tick.current.resourcesByXy, (k, v) => {
      if (Tick.current.resources[k].canPrice && Tick.current.resources[k].canStore) {
         resources[k] = true;
      }
   });
   forEach(building.resources, (k, v) => (resources[k] = true));
   forEach(building.resourceImports, (k, v) => (resources[k] = true));
   const storage = getStorageFor(xy, gameState);
   const percentage = storage.used / storage.total;

   return (
      <fieldset>
         <legend>{t(L.ResourceImport)}</legend>
         <div className="table-view">
            <table>
               <tbody>
                  <tr>
                     <th>{t(L.ResourceImportResource)}</th>
                     <th className="text-right">{t(L.ResourceImportStorage)}</th>
                     <th className="text-right">{t(L.ResourceImportImportPerCycle)}</th>
                     <th className="text-right">{t(L.ResourceImportImportCap)}</th>
                     <th></th>
                  </tr>
                  {keysOf(resources)
                     .sort((a, b) => Tick.current.resources[a].name().localeCompare(Tick.current.resources[b].name()))
                     .map((res) => {
                        const ri = building.resourceImports[res];
                        return (
                           <tr key={res}>
                              <td>{Tick.current.resources[res].name()}</td>
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
                                    showModal(<ChangeResourceImportModal building={building} resource={res} />)
                                 }
                              >
                                 <div className="m-icon small pointer text-link">settings</div>
                              </td>
                           </tr>
                        );
                     })}
               </tbody>
            </table>
         </div>
         <div className="separator"></div>
         <div className="row">
            <div className="f1">{t(L.StorageUsed)}</div>
            <div>
               <FormatNumber value={storage.used} /> / <FormatNumber value={storage.total} />
            </div>
         </div>
         <div className="sep5"></div>
         <ProgressBarComponent progress={percentage} />
      </fieldset>
   );
}
