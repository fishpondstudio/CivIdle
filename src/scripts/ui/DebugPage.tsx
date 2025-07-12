import { useState } from "react";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { clamp, keysOf, mapOf, safeAdd } from "../../../shared/utilities/Helper";
import type { PartialTabulate } from "../../../shared/utilities/TypeDefinitions";
import { useGameOptions } from "../Global";
import { TitleBarComponent } from "./TitleBarComponent";

export function DebugPage(): React.ReactNode {
   const [selectedResource, setSelectedResource] = useState<PartialTabulate<Resource>>({});
   const gameOptions = useGameOptions();
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
                     {keysOf(Config.ResourcePrice)
                        .sort((a, b) => {
                           const tier = Config.ResourceTier[a]! - Config.ResourceTier[b]!;
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
                                 <td>{Config.Resource[res].name()}</td>
                                 <td>{Config.ResourceTier[res]}</td>
                                 <td>{Config.ResourcePrice[res]}</td>
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
                  {mapOf(selectedResource, (res, amount) => Config.ResourcePrice[res]! * amount).reduce(
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
