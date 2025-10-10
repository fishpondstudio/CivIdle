import { Config } from "../../../shared/logic/Config";
import { combineResources } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { formatNumber, keysOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { getOwnedTradeTile } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { Singleton } from "../utilities/Singleton";
import { TableView } from "./TableView";
import { WarningComponent } from "./WarningComponent";

const availableTradingResourcesSortingState = { column: 0, asc: true };

export function AvailableTradingResourcesComponent(): React.ReactNode {
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
   const availableResources = combineResources(
      Array.from(Tick.current.playerTradeBuildings.values()).map((m) => m.resources),
   );
   return (
      <TableView
         style={{ maxHeight: "50vh", overflowY: "auto" }}
         header={[
            { name: t(L.ResourceImportResource), sortable: true },
            { name: t(L.ResourceAmount), sortable: true },
         ]}
         sortingState={availableTradingResourcesSortingState}
         data={keysOf(availableResources)}
         compareFunc={(a, b, col) => {
            switch (col) {
               case 1:
                  return (availableResources[a] ?? 0) - (availableResources[b] ?? 0);
               default:
                  return Config.Resource[a].name().localeCompare(Config.Resource[b].name());
            }
         }}
         renderRow={(res) => {
            return (
               <tr key={res}>
                  <td>{Config.Resource[res].name()}</td>
                  <td>{formatNumber(availableResources[res] ?? 0)}</td>
               </tr>
            );
         }}
      />
   );
}
