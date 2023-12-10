import classNames from "classnames";
import { useEffect, useState } from "react";
import { IPendingClaim } from "../../../server/src/Database";
import { notifyGameStateUpdate } from "../Global";
import { Resource } from "../definitions/ResourceDefinitions";
import { getStorageFor } from "../logic/BuildingLogic";
import { Tick } from "../logic/TickLogic";
import { OnNewPendingClaims, client, useTrades, useUser } from "../rpc/RPCClient";
import { getMyMapXy } from "../scenes/PathFinder";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { safeAdd } from "../utilities/Helper";
import { useTypedEvent } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { L, t } from "../utilities/i18n";
import { playClick, playError } from "../visuals/Sound";
import { AddTradeComponent } from "./AddTradeComponent";
import { IBuildingComponentProps } from "./BuildingPage";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { showModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { WarningComponent } from "./WarningComponent";

export function PlayerTradeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles[xy].building;
   if (!building) {
      return null;
   }
   const trades = useTrades();
   const user = useUser();
   const myXy = getMyMapXy();

   if (!myXy) {
      return (
         <>
            <WarningComponent icon="info">
               <div>{t(L.PlayerTradeClaimTileFirstWarning)}</div>
               <div
                  className="text-strong text-link row"
                  onClick={() => Singleton().sceneManager.loadScene(PlayerMapScene)}
               >
                  {t(L.PlayerTradeClaimTileFirst)}
               </div>
            </WarningComponent>
            <div className="sep10"></div>
         </>
      );
   }

   return (
      <fieldset>
         <legend>{t(L.PlayerTrade)}</legend>
         <PendingClaimComponent gameState={gameState} xy={xy} />
         <AddTradeComponent gameState={gameState} xy={xy} />
         <div className="table-view">
            <table>
               <tbody>
                  <tr>
                     <th>{t(L.PlayerTradeWant)}</th>
                     <th>{t(L.PlayerTradeOffer)}</th>
                     <th>{t(L.PlayerTradeFrom)}</th>
                     <th></th>
                  </tr>
                  {trades.map((trade) => {
                     const disableFill = user == null || trade.fromId == user.userId;
                     return (
                        <tr key={trade.id}>
                           <td>
                              {Tick.current.resources[trade.buyResource].name()} x{" "}
                              <FormatNumber value={trade.buyAmount} />
                           </td>
                           <td>
                              {Tick.current.resources[trade.sellResource].name()} x{" "}
                              <FormatNumber value={trade.sellAmount} />
                           </td>
                           <td>{trade.from}</td>
                           <td>
                              <div
                                 className={classNames({
                                    "text-link": !disableFill,
                                    "text-strong": true,
                                    "text-desc": disableFill,
                                 })}
                                 onClick={() => {
                                    if (!disableFill) {
                                       showModal(<FillPlayerTradeModal trade={trade} xy={xy} />);
                                    }
                                 }}
                              >
                                 {t(L.PlayerTradeFill)}
                              </div>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </fieldset>
   );
}

function PendingClaimComponent({ gameState, xy }: IBuildingComponentProps) {
   const [pendingClaims, setPendingClaims] = useState<IPendingClaim[]>([]);
   useEffect(() => {
      client.getPendingClaims().then(setPendingClaims);
   }, []);
   useTypedEvent(OnNewPendingClaims, () => {
      client.getPendingClaims().then(setPendingClaims);
   });

   if (pendingClaims.length == 0) {
      return null;
   }
   return (
      <>
         <div className="table-view">
            <table>
               <tr>
                  <th>{t(L.PlayerTradeResource)}</th>
                  <th>{t(L.PlayerTradeFillBy)}</th>
                  <th className="text-right">{t(L.PlayerTradeAmount)}</th>
                  <th></th>
               </tr>
               {pendingClaims.map((trade) => {
                  return (
                     <tr key={trade.id}>
                        <td>{Tick.current.resources[trade.resource as Resource].name()}</td>
                        <td>{trade.fillBy}</td>
                        <td className="text-right">
                           <FormatNumber value={trade.amount} />
                        </td>
                        <td
                           className="text-right text-strong text-link"
                           onClick={async () => {
                              const { total, used } = getStorageFor(xy, gameState);
                              if (total - used >= trade.amount) {
                                 await client.claimTrade(trade.id).then(setPendingClaims);
                                 const building = gameState.tiles[xy].building;
                                 if (building) {
                                    playClick();
                                    safeAdd(building.resources, trade.resource, trade.amount);
                                    notifyGameStateUpdate();
                                 }
                              } else {
                                 showToast(t(L.PlayerTradeClaimNotEnoughStorage));
                                 playError();
                              }
                           }}
                        >
                           <span>{t(L.PlayerTradeClaim)}</span>
                        </td>
                     </tr>
                  );
               })}
            </table>
         </div>
         <div className="sep10"></div>
      </>
   );
}
