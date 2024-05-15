import { Config } from "../../../shared/logic/Config";
import { jsxMapOf } from "../utilities/Helper";
import { BuildingColorComponent } from "./BuildingColorComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function TraditionBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         {jsxMapOf(Config.Tradition, (tradition, def) => {
            return (
               <fieldset key={tradition}>
                  <legend>{def.name()}</legend>
                  {def.content.map((u) => {
                     const unlockable = Config.Unlockable[u];
                     return <div key={u}>{unlockable.name()}</div>;
                  })}
               </fieldset>
            );
         })}
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
