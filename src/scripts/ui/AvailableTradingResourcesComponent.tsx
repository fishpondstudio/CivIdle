import { useState } from "react";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { combineResources, deductResourceFrom } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { clamp, formatNumber, keysOf, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { getOwnedTradeTile } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { Singleton } from "../utilities/Singleton";
import { playClick } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { TableView } from "./TableView";
import { WarningComponent } from "./WarningComponent";

const availableTradingResourcesSortingState = { column: 0, asc: true };

export function AvailableTradingResourcesComponent(): React.ReactNode {
   const myXy = getOwnedTradeTile();
   const gs = useGameState();
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
   const availableResources = combineResources(
      Array.from(Tick.current.playerTradeBuildings.values()).map((m) => m.resources),
   );
   return (
      <TableView
         style={{ maxHeight: "50vh", overflowY: "auto" }}
         header={[
            { name: t(L.ResourceImportResource), sortable: true },
            { name: t(L.ResourceAmount), sortable: true },
            { name: t(L.DestroyResource), sortable: false },
         ]}
         sortingState={availableTradingResourcesSortingState}
         data={keysOf(availableResources)}
         compareFunc={(a, b, col) => {
            switch (col) {
               case 1:
                  return (availableResources[a] ?? 0) - (availableResources[b] ?? 0);
               default:
                  return Config.Material[a].name().localeCompare(Config.Material[b].name());
            }
         }}
         renderRow={(res) => {
            return (
               <TableRowComponent
                  key={res}
                  resource={res}
                  amount={availableResources[res] ?? 0}
                  gameState={gs}
               />
            );
         }}
      />
   );
}

function TableRowComponent({
   resource,
   amount,
   gameState,
}: { resource: Material; amount: number; gameState: GameState }): React.ReactNode {
   const resourceName = Config.Material[resource].name();
   const [destroyAmount, setDestroyAmount] = useState(0);
   return (
      <tr>
         <td>{resourceName}</td>
         <td>{formatNumber(amount)}</td>
         <td style={{ width: 0 }}>
            <div className="row g5">
               <div
                  className="text-link text-small"
                  onClick={() => setDestroyAmount(Math.floor(amount * 0.25))}
               >
                  25%
               </div>
               <div
                  className="text-link text-small"
                  onClick={() => setDestroyAmount(Math.floor(amount * 0.5))}
               >
                  50%
               </div>
               <div className="text-link text-small" onClick={() => setDestroyAmount(amount)}>
                  100%
               </div>
               <input
                  type="text"
                  value={destroyAmount}
                  onChange={(e) => setDestroyAmount(clamp(safeParseInt(e.target.value), 0, amount))}
                  style={{ width: 100 }}
               />
               <button
                  style={{ width: 25, padding: 0 }}
                  onClick={() => {
                     const result = deductResourceFrom(
                        resource,
                        clamp(destroyAmount, 0, amount),
                        Array.from(Tick.current.playerTradeBuildings.keys()),
                        gameState,
                     );
                     setDestroyAmount(0);
                     notifyGameStateUpdate();
                     playClick();
                     showToast(
                        t(L.XResourceHasBeenDestroyed, {
                           amount: formatNumber(result.amount),
                           resource: resourceName,
                        }),
                     );
                  }}
               >
                  <div className="m-icon small">delete</div>
               </button>
            </div>
         </td>
      </tr>
   );
}
