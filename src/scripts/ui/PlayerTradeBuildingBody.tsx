import { useState } from "react";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
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
import { hideModal, showModal } from "./GlobalModal";
import { PendingTradesComponent } from "./PendingTradesComponent";
import { PlayerTradeNewComponent } from "./PlayerTradeNewComponent";
import { ResourceImportComponent } from "./ResourceImportComponent";

type Tab = "trades" | "pending" | "import" | "available";
let savedTab: Tab = "trades";

export function PlayerTradeBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const [currentTab, setCurrentTab] = useState<Tab>(savedTab);
   let content: React.ReactNode = null;

   if (currentTab === "trades") {
      savedTab = "trades";
      content = (
         <article role="tabpanel" style={{ padding: "8px" }}>
            <button
               className="w100 mb10"
               onClick={() => {
                  showModal(<PlayerTradeModal />);
               }}
            >
               Open Player Trades
            </button>
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
               {t(L.PlayerTradeTabTrades)}
            </button>
            <button onClick={() => setCurrentTab("pending")} aria-selected={currentTab === "pending"}>
               {t(L.PlayerTradeTabPendingTrades)}
            </button>{" "}
            <button onClick={() => setCurrentTab("available")} aria-selected={currentTab === "available"}>
               {t(L.PlayerTradeTabAvailableTrades)}
            </button>
            <button onClick={() => setCurrentTab("import")} aria-selected={currentTab === "import"}>
               {t(L.PlayerTradeTabImport)}
            </button>
         </menu>
         {content}
      </div>
   );
}

function PlayerTradeModal(): React.ReactNode {
   const gameState = useGameState();
   return (
      <div className="window" style={{ width: "700px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerTrade)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <PlayerTradeNewComponent gameState={gameState} />
         </div>
      </div>
   );
}
