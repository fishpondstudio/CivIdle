import Tippy from "@tippyjs/react";
import { TableVirtuoso } from "react-virtuoso";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
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
import { PendingClaims, PendingClaimUpdated, RequestPendingClaimUpdate } from "../logic/PendingClaim";
import { client } from "../rpc/RPCClient";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { playError, playKaching } from "../visuals/Sound";
import { FixedLengthText } from "./FixedLengthText";
import { showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

export function PendingClaimComponent({ gameState }: { gameState: GameState }) {
   refreshOnTypedEvent(PendingClaimUpdated);
   const pendingClaims = PendingClaims.filter((trade) => trade.resource in Config.Resource);
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
         const { resources } = await client.claimTradesV2(toClaim);
         RequestPendingClaimUpdate.emit();
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
            forEach(resources, (res, amount) => {
               const tradeValue = amount * (Config.ResourcePrice[res] ?? 0);
               if (eic) {
                  safeAdd(eic.building.resources, "TradeValue", tradeValue);
               }
               gameState.tradeValue += tradeValue;
            });
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
            disabled={pendingClaims.length === 0}
            className="w100 jcc row mb10"
            onClick={() => {
               if (pendingClaims.length === 0) {
                  playError();
                  return;
               }
               claimTrades(pendingClaims.slice(0).sort((a, b) => a.amount - b.amount));
            }}
         >
            <div className="m-icon small">local_shipping</div>
            <div className="f1 text-strong">{t(L.PlayerTradeClaimAll)}</div>
         </button>
         <div className="table-view">
            {pendingClaims.length === 0 ? (
               <div className="col cc g5 text-desc" style={{ height: "50vh" }}>
                  <div className="m-icon" style={{ fontSize: "4rem" }}>
                     info
                  </div>
                  <div style={{ fontSize: "2rem" }}>{t(L.NothingHere)}</div>
               </div>
            ) : (
               <TableVirtuoso
                  style={{ height: "50vh" }}
                  data={pendingClaims}
                  fixedHeaderContent={() => {
                     return (
                        <tr>
                           <th style={{ width: "30px" }}></th>
                           <th>{t(L.PlayerTradeResource)}</th>
                           <th>{t(L.PlayerTradeFillBy)}</th>
                           <th className="text-right">{t(L.PlayerTradeAmount)}</th>
                           <th></th>
                        </tr>
                     );
                  }}
                  itemContent={(idx, trade) => {
                     return (
                        <>
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
                                 <span>
                                    <FormatNumber value={trade.amount} />
                                 </span>
                              </Tippy>
                           </td>
                           <td className="text-right">
                              <div className="text-link text-strong" onClick={() => claimTrades([trade])}>
                                 {t(L.PlayerTradeClaim)}
                              </div>
                           </td>
                        </>
                     );
                  }}
               />
            )}
         </div>
      </>
   );
}
