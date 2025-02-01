import Tippy from "@tippyjs/react";
import { useEffect, useState } from "react";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { addResourceTo, getAvailableStorage } from "../../../shared/logic/ResourceLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { PendingClaimFlag, type IPendingClaim } from "../../../shared/utilities/Database";
import {
   clamp,
   forEach,
   formatNumber,
   hasFlag,
   mapOf,
   safeAdd,
   sizeOf,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { OnNewPendingClaims, client } from "../rpc/RPCClient";
import { useTypedEvent } from "../utilities/Hook";
import { playError, playKaching } from "../visuals/Sound";
import type { IBuildingComponentProps } from "./BuildingPage";
import { FixedLengthText } from "./FixedLengthText";
import { showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

export function PendingClaimComponent({ gameState, xy }: IBuildingComponentProps) {
   const [_pendingClaims, setPendingClaims] = useState<IPendingClaim[]>([]);
   const pendingClaims = _pendingClaims.filter((trade) => trade.resource in Config.Resource);

   useEffect(() => {
      client.getPendingClaims().then(setPendingClaims);
   }, []);

   useTypedEvent(OnNewPendingClaims, () => {
      client.getPendingClaims().then(setPendingClaims);
   });

   if (pendingClaims.length === 0) {
      return <div className="text-desc">{t(L.NothingHere)}</div>;
   }

   const claimTrades = async (trades: IPendingClaim[]) => {
      try {
         const tiles = Array.from(Tick.current.playerTradeBuildings.keys());
         const storageAvailable = getAvailableStorage(tiles, gameState);
         const toClaim: Record<string, number> = {};
         let storageUsed = 0;
         for (const claim of trades) {
            if (storageUsed + claim.amount > storageAvailable) {
               toClaim[claim.id] = clamp(storageAvailable - storageUsed, 0, Number.POSITIVE_INFINITY);
               break;
            }
            toClaim[claim.id] = claim.amount;
            storageUsed += claim.amount;
         }
         const { pendingClaims, resources } = await client.claimTradesV2(toClaim);
         setPendingClaims(pendingClaims);
         forEach(resources, (res, amount) => {
            const result = addResourceTo(res, amount, tiles, gameState);
            console.assert(result.amount === amount);
         });
         if (sizeOf(resources) > 0) {
            playKaching();
            showToast(
               t(L.PlayerTradeClaimAllMessageV2, {
                  resources: mapOf(
                     resources,
                     (res, amount) => `${Config.Resource[res].name()}: ${formatNumber(amount)}`,
                  ).join(", "),
               }),
            );
            const eic = Tick.current.specialBuildings.get("EastIndiaCompany");
            if (eic) {
               forEach(resources, (res, amount) => {
                  safeAdd(eic.building.resources, "TradeValue", amount * (Config.ResourcePrice[res] ?? 0));
               });
            }
         } else {
            playError();
            showToast(t(L.PlayerTradeClaimAllFailedMessageV2));
         }
      } catch (error) {
         playError();
         showToast(String(error));
      }
   };

   return (
      <>
         <button
            className="w100 jcc row mb10 mt5"
            onClick={() => claimTrades(pendingClaims.slice(0).sort((a, b) => a.amount - b.amount))}
         >
            <div className="m-icon small">local_shipping</div>
            <div className="f1 text-strong">{t(L.PlayerTradeClaimAll)}</div>
         </button>
         <div className="table-view">
            <table>
               <tbody>
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
                                    <div className="m-icon small text-center text-orange">
                                       currency_exchange
                                    </div>
                                 </Tippy>
                              ) : null}
                           </td>
                           <td>{Config.Resource[trade.resource as Resource].name()}</td>
                           <td>
                              <FixedLengthText text={trade.fillBy} length={10} />
                           </td>
                           <td className="text-right">
                              <Tippy content={trade.amount}>
                                 <FormatNumber value={trade.amount} />
                              </Tippy>
                           </td>
                           <td className="text-right">
                              <div className="text-link text-strong" onClick={() => claimTrades([trade])}>
                                 {t(L.PlayerTradeClaim)}
                              </div>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
         <div className="sep10" />
      </>
   );
}
