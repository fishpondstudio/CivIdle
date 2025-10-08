import { useState } from "react";
import { L, t } from "../../../shared/utilities/i18n";
import { getOwnedTradeTile } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { Singleton } from "../utilities/Singleton";
import { AvailableTradingResourcesComponent } from "./AvailableTradingResourcesComponent";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingInputModeComponent } from "./BuildingInputModeComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { showModal } from "./GlobalModal";
import { PendingTradesComponent } from "./PendingTradesComponent";
import { PlayerTradeModal } from "./PlayerTradeModal";
import { ResourceImportComponent } from "./ResourceImportComponent";
import { WarningComponent } from "./WarningComponent";

type Tab = "trades" | "pending" | "import" | "available";
let savedTab: Tab = "trades";

export function PlayerTradeBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const [currentTab, setCurrentTab] = useState<Tab>(savedTab);
   let content: React.ReactNode = null;

   if (currentTab === "trades") {
      savedTab = "trades";
      const myXy = getOwnedTradeTile();
      let tradeButton: React.ReactNode = null;
      if (myXy) {
         tradeButton = (
            <button
               className="w100 mb10 row text-strong"
               onClick={() => {
                  showModal(<PlayerTradeModal />);
               }}
            >
               <div className="m-icon small">open_in_new</div>
               <div className="f1">{t(L.OpenPlayerTrades)}</div>
            </button>
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
      content = (
         <article role="tabpanel" style={{ padding: "8px" }}>
            {tradeButton}
            <BuildingStorageComponent gameState={gameState} xy={xy} />
            <BuildingWorkerComponent gameState={gameState} xy={xy} />
            <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
            <BuildingInputModeComponent gameState={gameState} xy={xy} />
            <BuildingValueComponent gameState={gameState} xy={xy} />
            <BuildingColorComponent gameState={gameState} xy={xy} />
            <BuildingSellComponent gameState={gameState} xy={xy} />
         </article>
      );
   } else if (currentTab === "pending") {
      savedTab = "pending";
      content = <PendingTradesComponent gameState={gameState} xy={xy} />;
   } else if (currentTab === "import") {
      savedTab = "import";
      content = (
         <article role="tabpanel" style={{ padding: "8px" }}>
            <ResourceImportComponent gameState={gameState} xy={xy} />
         </article>
      );
   } else if (currentTab === "available") {
      savedTab = "available";
      content = (
         <article role="tabpanel" style={{ padding: "8px" }}>
            <AvailableTradingResourcesComponent />
         </article>
      );
   }

   return (
      <div className="window-body">
         <BuildingUpgradeComponent gameState={gameState} xy={xy} key={xy} />
         <menu role="tablist">
            <button onClick={() => setCurrentTab("trades")} aria-selected={currentTab === "trades"}>
               {t(L.Caravansary)}
            </button>
            <button onClick={() => setCurrentTab("import")} aria-selected={currentTab === "import"}>
               {t(L.PlayerTradeTabImport)}
            </button>
            <button onClick={() => setCurrentTab("pending")} aria-selected={currentTab === "pending"}>
               {t(L.PlayerTradeTabPendingTrades)}
            </button>
            <button onClick={() => setCurrentTab("available")} aria-selected={currentTab === "available"}>
               {t(L.PlayerTradeTabAvailableTrades)}
            </button>
         </menu>
         {content}
      </div>
   );
}
