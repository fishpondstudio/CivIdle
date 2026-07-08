import { useState } from "react";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import { Config } from "../../../shared/logic/Config";
import { clamp, keysOf, mapOf, safeAdd } from "../../../shared/utilities/Helper";
import type { PartialTabulate } from "../../../shared/utilities/TypeDefinitions";
import { TitleBarComponent } from "./TitleBarComponent";

export function DebugPage(): React.ReactNode {
   const [selectedResource, setSelectedResource] = useState<PartialTabulate<Material>>({});
   return (
      <div className="window">
         <TitleBarComponent>Debug</TitleBarComponent>
         <div className="window-body">
            <div className="table-view">
               <table>
                  <thead>
                     <tr>
                        <th></th>
                        <th>Resource</th>
                        <th>Tier</th>
                        <th className="text-right">Price</th>
                     </tr>
                  </thead>
                  <tbody>
                     {keysOf(Config.MaterialPrice)
                        .sort((a, b) => {
                           const tier = Config.MaterialTier[a]! - Config.MaterialTier[b]!;
                           if (tier !== 0) {
                              return tier;
                           }
                           return a.localeCompare(b);
                        })
                        .map((res) => {
                           return (
                              <tr key={res}>
                                 <td className="row">
                                    <div
                                       className="m-icon small text-desc"
                                       onClick={() => {
                                          safeAdd(selectedResource, res, 1);
                                          setSelectedResource({ ...selectedResource });
                                       }}
                                    >
                                       add_box
                                    </div>
                                    <code>{selectedResource[res] ?? 0}</code>
                                    <div
                                       className="m-icon small text-desc"
                                       onClick={() => {
                                          safeAdd(selectedResource, res, -1);
                                          selectedResource[res] = clamp(
                                             selectedResource[res]!,
                                             0,
                                             Number.POSITIVE_INFINITY,
                                          );
                                          setSelectedResource({ ...selectedResource });
                                       }}
                                    >
                                       indeterminate_check_box
                                    </div>
                                 </td>
                                 <td>{Config.Material[res].name()}</td>
                                 <td>{Config.MaterialTier[res]}</td>
                                 <td>{Config.MaterialPrice[res]}</td>
                              </tr>
                           );
                        })}
                  </tbody>
               </table>
            </div>
            <div className="sep5"></div>
            <div className="row">
               <div>Selected</div>
               <div className="f1 text-right">
                  {mapOf(selectedResource, (res, amount) => Config.MaterialPrice[res]! * amount).reduce(
                     // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
                     (prev, curr) => prev + curr,
                     0,
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
