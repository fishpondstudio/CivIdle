import { useState } from "react";
import { L, t } from "../../../shared/utilities/i18n";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingInputModeComponent } from "./BuildingInputModeComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingProductionPriorityComponent } from "./BuildingProductionPriorityComponent";
import { BuildingSellComponent } from "./BuildingSellComponent";
import { BuildingStorageComponent } from "./BuildingStorageComponent";
import { BuildingUpgradeComponent } from "./BuildingUpgradeComponent";
import { BuildingWorkerComponent } from "./BuildingWorkerComponent";
import { PendingTradesComponent } from "./PendingTradesComponent";
import { PlayerTradeComponent } from "./PlayerTradeComponent";
import { ResourceImportComponent } from "./ResourceImportComponent";

type Tab = "trades" | "pending" | "import";
let savedCaravanTab: Tab = "trades";

export function PlayerTradeBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const [currentTab, setCurrentTab] = useState<Tab>(savedCaravanTab);
   let content: React.ReactNode = null;

   if (currentTab === "trades") {
      savedCaravanTab = "trades";
      content = <PlayerTradeComponent gameState={gameState} xy={xy} />;
   } else if (currentTab === "pending") {
      savedCaravanTab = "pending";
      content = <PendingTradesComponent gameState={gameState} xy={xy} />;
   } else if (currentTab === "import") {
      savedCaravanTab = "import";
      content = (
         <article role="tabpanel" className="f1 column" style={{ padding: "8px" }}>
            <ResourceImportComponent gameState={gameState} xy={xy} />
         </article>
      );
   }

   return (
      <div className="window-body column">
         <BuildingUpgradeComponent gameState={gameState} xy={xy} key={xy} />

         <menu role="tablist">
            <button onClick={() => setCurrentTab("trades")} aria-selected={currentTab === "trades"}>
               {t(L.PlayerTradeTabTrades)}
            </button>
            <button onClick={() => setCurrentTab("pending")} aria-selected={currentTab === "pending"}>
               {t(L.PlayerTradeTabPendingTrades)}
            </button>
            <button onClick={() => setCurrentTab("import")} aria-selected={currentTab === "import"}>
               {t(L.PlayerTradeTabImport)}
            </button>
         </menu>
         {content}

         <BuildingStorageComponent gameState={gameState} xy={xy} />
         <BuildingWorkerComponent gameState={gameState} xy={xy} />
         <BuildingProductionPriorityComponent gameState={gameState} xy={xy} />
         <BuildingInputModeComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
         <BuildingSellComponent gameState={gameState} xy={xy} />
      </div>
   );
}
