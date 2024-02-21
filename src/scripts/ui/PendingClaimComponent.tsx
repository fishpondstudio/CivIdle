import Tippy from "@tippyjs/react";
import { useEffect, useState } from "react";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { getStorageFor } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { PendingClaimFlag, type IPendingClaim } from "../../../shared/utilities/Database";
import { hasFlag, safeAdd } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { OnNewPendingClaims, client } from "../rpc/RPCClient";
import { useTypedEvent } from "../utilities/Hook";
import { playError, playKaching } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

export function PendingClaimComponent({ gameState, xy }: IBuildingComponentProps) {
   const [pendingClaims, setPendingClaims] = useState<IPendingClaim[]>([]);

   useEffect(() => {
      client.getPendingClaims().then(setPendingClaims);
   }, []);

   useTypedEvent(OnNewPendingClaims, () => {
      client.getPendingClaims().then(setPendingClaims);
   });

   if (pendingClaims.length === 0) {
      return null;
   }

   const claimTrades = async (trades: IPendingClaim[]) => {
      try {
         const building = gameState.tiles.get(xy)?.building;
         if (!building) {
            return;
         }
         const { total, used } = getStorageFor(xy, gameState);
         const available = total - used;
         const toClaim: string[] = [];
         let storageNeeded = 0;
         for (const claim of trades) {
            if (storageNeeded + claim.amount > available) {
               break;
            }
            toClaim.push(claim.id);
            storageNeeded += claim.amount;
         }
         playKaching();
         const result = await client.claimTrades(toClaim);
         setPendingClaims(result.pendingClaims);
         const confirmed = new Set(result.claimedIds);
         for (const claim of trades) {
            if (confirmed.has(claim.id)) {
               safeAdd(building.resources, claim.resource, claim.amount);
            }
         }
         if (confirmed.size > 0) {
            showToast(t(L.PlayerTradeClaimAllMessage, { count: confirmed.size }));
         } else {
            showToast(t(L.PlayerTradeClaimAllFailedMessage, { count: confirmed.size }));
         }
      } catch (error) {
         playError();
         showToast(String(error));
      }
   };

   return (
      <>
         <button
            className="w100 jcc row mb10"
            onClick={() => claimTrades(pendingClaims.slice(0).sort((a, b) => a.amount - b.amount))}
         >
            <div className="m-icon small">local_shipping</div>
            <div className="f1 text-strong">{t(L.PlayerTradeClaimAll)}</div>
         </button>
         <div className="table-view">
            <table>
               <tr>
                  <th style={{ width: "30px" }}></th>
                  <th>{t(L.PlayerTradeResource)}</th>
                  <th>{t(L.PlayerTradeFillBy)}</th>
                  <th className="text-right">{t(L.PlayerTradeAmount)}</th>
                  <th></th>
               </tr>
               {pendingClaims.map((trade) => {
                  return (
                     <tr key={trade.id}>
                        <td>
                           {hasFlag(trade.flag, PendingClaimFlag.Tariff) ? (
                              <Tippy content={t(L.PlayerTradeTariffTooltip)}>
                                 <div className="m-icon small text-center text-orange">currency_exchange</div>
                              </Tippy>
                           ) : null}
                        </td>
                        <td>{Config.Resource[trade.resource as Resource].name()}</td>
                        <td>{trade.fillBy}</td>
                        <td className="text-right">
                           <FormatNumber value={trade.amount} />
                        </td>
                        <td className="text-right">
                           <div className="text-link text-strong" onClick={() => claimTrades([trade])}>
                              {t(L.PlayerTradeClaim)}
                           </div>
                        </td>
                     </tr>
                  );
               })}
            </table>
         </div>
         <div className="separator" />
      </>
   );
}
