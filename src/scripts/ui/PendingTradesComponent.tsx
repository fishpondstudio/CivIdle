import { L, t } from "../../../shared/utilities/i18n";
import { getOwnedTradeTile } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { Singleton } from "../utilities/Singleton";
import type { IBuildingComponentProps } from "./BuildingPage";
import { PendingClaimComponent } from "./PendingClaimComponent";
import { WarningComponent } from "./WarningComponent";

export function PendingTradesComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const myXy = getOwnedTradeTile();
   if (!myXy) {
      return (
         <article role="tabpanel" style={{ padding: "8px" }}>
            <WarningComponent icon="info">
               <div>{t(L.PlayerTradeClaimTileFirstWarning)}</div>
               <div
                  className="text-strong text-link row"
                  onClick={() => Singleton().sceneManager.loadScene(PlayerMapScene)}
               >
                  {t(L.PlayerTradeClaimTileFirst)}
               </div>
            </WarningComponent>
         </article>
      );
   }

   return (
      <article role="tabpanel" style={{ padding: "8px" }}>
         <PendingClaimComponent gameState={gameState} />
      </article>
   );
}
