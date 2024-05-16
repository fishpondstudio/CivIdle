import { NoPrice, NoStorage } from "../../../shared/definitions/ResourceDefinitions";
import { unlockedResources } from "../../../shared/logic/IntraTickCache";
import { keysOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { getMyMapXy } from "../scenes/PathFinder";
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
   const myXy = getMyMapXy();
   if (!myXy) {
      return (
         <article role="tabpanel" className="f1 column" style={{ padding: "8px" }}>
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

   const resources = keysOf(unlockedResources(gameState)).filter((r) => !NoStorage[r] && !NoPrice[r]);
   return (
      <article role="tabpanel" className="f1 column" style={{ padding: "8px" }}>
         <fieldset>
            <legend>{t(L.PlayerTradePendingTrades)}</legend>
            <PendingClaimComponent gameState={gameState} xy={xy} />
         </fieldset>
      </article>
   );
}
