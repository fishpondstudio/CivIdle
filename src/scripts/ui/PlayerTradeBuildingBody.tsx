import { L, t } from "../../../shared/utilities/i18n";
import { PendingClaims } from "../logic/PendingClaim";
import { getOwnedTradeTile } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { Singleton } from "../utilities/Singleton";
import { AddTradeButtonComponent } from "./AddTradeComponent";
import { AddTradeModal } from "./AddTradeModal";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingInputModeComponent } from "./BuildingInputModeComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { hideModal, showModal } from "./GlobalModal";
import { PendingClaimModal } from "./PendingClaimModal";
import { PlayerTradeModal } from "./PlayerTradeModal";
import { ResourceImportComponent } from "./ResourceImportComponent";
import { WarningComponent } from "./WarningComponent";

export function PlayerTradeBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const myXy = getOwnedTradeTile();
   let tradeButton: React.ReactNode = null;
   if (myXy) {
      tradeButton = (
         <>
            <button
               className="w100 row text-strong mb5"
               onClick={() => {
                  showModal(<PlayerTradeModal />);
               }}
            >
               <div className="m-icon small">open_in_new</div>
               <div className="f1">{t(L.OpenPlayerTrades)}</div>
            </button>
            <div className="row mb10">
               <AddTradeButtonComponent onClick={() => showModal(<AddTradeModal hideModal={hideModal} />)} />
               <button
                  className="f1 text-strong"
                  onClick={() => showModal(<PendingClaimModal hideModal={hideModal} />)}
               >
                  {t(L.PlayerTradeTabPendingTrades)} ({PendingClaims.length})
               </button>
            </div>
         </>
      );
   } else {
      tradeButton = (
         <WarningComponent icon="info" className="mb10">
            <div>{t(L.PlayerTradeClaimTileFirstWarning)}</div>
            <div
               className="text-strong text-link row"
               onClick={() => Singleton().sceneManager.loadScene(PlayerMapScene)}
            >
               {t(L.PlayerTradeClaimTileFirst)}
            </div>
         </WarningComponent>
      );
   }
   const content = (
      <>
         {tradeButton}
         <ResourceImportComponent gameState={gameState} xy={xy} />
         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingInputModeComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </>
   );

   return (
      <div className="window-body">
         <BuildingUpgradeComponent gameState={gameState} xy={xy} key={xy} />
         {content}
      </div>
   );
}
