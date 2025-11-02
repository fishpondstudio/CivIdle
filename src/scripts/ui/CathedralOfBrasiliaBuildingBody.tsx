import { getCathedralOfBrasiliaResources } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { ILouvreBuildingData } from "../../../shared/logic/Tile";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { SpaceshipIdleComponent } from "./SpaceshipIdleComponent";
import { WarningComponent } from "./WarningComponent";

export function CathedralOfBrasiliaBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building as ILouvreBuildingData;
   if (!building) {
      return null;
   }
   const { input, output, unused } = getCathedralOfBrasiliaResources(xy, gameState);
   return (
      <div className="window-body">
         <SpaceshipIdleComponent gameState={gameState} type={building.type} />
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <WarningComponent icon="info" className="mb10 text-sm">
               <RenderHTML html={t(L.CathedralOfBrasiliaWarningHTML)} />
            </WarningComponent>
            <div className="table-view">
               <table>
                  <thead>
                     <tr></tr>
                  </thead>
                  <tbody>
                     {Array.from(output).map((res) => (
                        <tr key={res}>
                           <td>{Config.Material[res].name()}</td>
                           <td style={{ width: 0 }}>
                              {input.has(res) ? (
                                 <div className="m-icon small text-green">check_circle</div>
                              ) : null}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </fieldset>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
