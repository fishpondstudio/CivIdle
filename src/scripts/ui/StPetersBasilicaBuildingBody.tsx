import { formatPercent, mMapOf } from "../../../shared/Helper";
import { ST_PETERS_FAITH_MULTIPLIER, ST_PETERS_STORAGE_MULTIPLIER } from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import { getBuildingsByType } from "../logic/IntraTickCache";
import { getBuildingsThatProduce } from "../logic/ResourceLogic";
import { L, t } from "../utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";

export function StPetersBasilicaBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   let totalLevel = 0;
   let totalFaith = 0;
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <div className="table-view">
            <table>
               <thead>
                  <tr>
                     <th></th>
                     <th className="text-right">{t(L.Level)}</th>
                     <th className="text-right">{Config.Resource.Faith.name()}</th>
                  </tr>
               </thead>
               <tbody>
                  {getBuildingsThatProduce("Faith").flatMap((b) =>
                     mMapOf(getBuildingsByType(b, gameState), (k, v) => {
                        if (v.building.status !== "completed") {
                           return [];
                        }
                        totalLevel += v.building.level;
                        totalFaith += v.building.resources.Faith ?? 0;
                        return (
                           <tr key={k}>
                              <td>{Config.Building[v.building.type].name()}</td>
                              <td className="text-right">{v.building.level}</td>
                              <td className="text-right">
                                 <FormatNumber value={v.building.resources.Faith ?? 0} />
                              </td>
                           </tr>
                        );
                     }),
                  )}
                  <tr>
                     <td>{t(L.Faith)}</td>
                     <td className="text-right"></td>
                     <td className="text-right">
                        <div>
                           +<FormatNumber value={Math.floor(totalFaith * ST_PETERS_FAITH_MULTIPLIER)} />
                        </div>
                        <div className="text-desc text-small">
                           ({formatPercent(ST_PETERS_FAITH_MULTIPLIER, 0)})
                        </div>
                     </td>
                  </tr>
                  <tr>
                     <td>{t(L.Storage)}</td>
                     <td className="text-right">
                        <div>
                           <FormatNumber value={totalLevel * ST_PETERS_STORAGE_MULTIPLIER} />
                        </div>
                        <div className="text-desc text-small">
                           x
                           <FormatNumber value={ST_PETERS_STORAGE_MULTIPLIER} />
                        </div>
                     </td>
                     <td className="text-right"></td>
                  </tr>
               </tbody>
            </table>
         </div>
         <div className="sep10"></div>
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
