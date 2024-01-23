import classNames from "classnames";
import { useState } from "react";
import { AccountLevel } from "../../../shared/utilities/Database";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { AccountLevelImages, AccountLevelNames } from "../logic/AccountLevel";
import { useUser } from "../rpc/RPCClient";
import { getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { playError } from "../visuals/Sound";
import { ChangePlayerHandleModal } from "./ChangePlayerHandleModal";
import { showModal } from "./GlobalModal";

export function PlayerHandleComponent() {
   const user = useUser();
   const opt = useGameOptions();
   const gs = useGameState();
   const [showDetails, setShowDetails] = useState(false);
   const accountLevel = user?.level ?? AccountLevel.Tribune;
   return (
      <fieldset>
         <legend>{t(L.PlayerHandle)}</legend>
         {user == null ? (
            <div className="text-strong">{t(L.PlayerHandleOffline)}</div>
         ) : (
            <div className="row">
               <div className="text-strong">{user?.handle}</div>
               <img
                  className="ml5 player-flag"
                  src={getFlagUrl(user?.flag)}
                  title={getCountryName(user?.flag)}
               />
               <div className="f1" />
               <div
                  className={classNames("text-link text-strong", { disabled: !user })}
                  onClick={() => {
                     if (user) {
                        showModal(<ChangePlayerHandleModal />);
                     } else {
                        playError();
                     }
                  }}
               >
                  {t(L.ChangePlayerHandle)}
               </div>
            </div>
         )}
         {showDetails ? (
            <>
               <div className="separator" />
               <div className="row text-strong">
                  <div className="f1">{t(L.AccountLevel)}</div>
                  <img
                     src={AccountLevelImages[accountLevel]}
                     alt={AccountLevelNames[accountLevel]()}
                     className="player-level mr5"
                  />
                  <div>{AccountLevelNames[accountLevel]()}</div>
               </div>
               <div className="separator" />
               <div className="table-view">
                  <table>
                     <tbody>
                        <tr>
                           <th></th>
                           <th
                              aria-label={AccountLevelNames[AccountLevel.Tribune]()}
                              data-balloon-pos="up"
                              data-balloon-text="left"
                           >
                              <img className="player-level" src={AccountLevelImages[AccountLevel.Tribune]} />
                           </th>
                           <th
                              aria-label={AccountLevelNames[AccountLevel.Quaestor]()}
                              data-balloon-pos="up"
                              data-balloon-text="left"
                           >
                              <img className="player-level" src={AccountLevelImages[AccountLevel.Quaestor]} />
                           </th>
                           <th
                              aria-label={AccountLevelNames[AccountLevel.Aedile]()}
                              data-balloon-pos="up"
                              data-balloon-text="left"
                           >
                              <img className="player-level" src={AccountLevelImages[AccountLevel.Aedile]} />
                           </th>
                           <th
                              aria-label={AccountLevelNames[AccountLevel.Praetor]()}
                              data-balloon-pos="up"
                              data-balloon-text="left"
                           >
                              <img className="player-level" src={AccountLevelImages[AccountLevel.Praetor]} />
                           </th>
                           <th
                              aria-label={AccountLevelNames[AccountLevel.Consul]()}
                              data-balloon-pos="up"
                              data-balloon-text="left"
                           >
                              <img className="player-level" src={AccountLevelImages[AccountLevel.Consul]} />
                           </th>
                        </tr>
                        <tr>
                           <td>{t(L.AccountChatBadge)}</td>
                           <td>
                              <div className="m-icon small text-red">cancel</div>
                           </td>
                           <td>
                              <div className="m-icon small text-green">check_circle</div>
                           </td>
                           <td>
                              <div className="m-icon small text-green">check_circle</div>
                           </td>
                           <td>
                              <div className="m-icon small text-green">check_circle</div>
                           </td>
                           <td>
                              <div className="m-icon small text-green">check_circle</div>
                           </td>
                        </tr>
                        <tr>
                           <td>{t(L.AccountLeaderboard)}</td>
                           <td>
                              <div className="m-icon small text-red">cancel</div>
                           </td>
                           <td>
                              <div className="m-icon small text-green">check_circle</div>
                           </td>
                           <td>
                              <div className="m-icon small text-green">check_circle</div>
                           </td>
                           <td>
                              <div className="m-icon small text-green">check_circle</div>
                           </td>
                           <td>
                              <div className="m-icon small text-green">check_circle</div>
                           </td>
                        </tr>
                        <tr>
                           <td>{t(L.AccountActiveTrade)}</td>
                           <td>2</td>
                           <td>4</td>
                           <td>6</td>
                           <td>8</td>
                           <td>10</td>
                        </tr>
                        <tr>
                           <td>{t(L.AccountTradeValuePerMinute)}</td>
                           <td>1,000</td>
                           <td>∞</td>
                           <td>∞</td>
                           <td>∞</td>
                           <td>∞</td>
                        </tr>
                        <tr>
                           <td>{t(L.AccountTradePriceRange)}</td>
                           <td>5%</td>
                           <td>10%</td>
                           <td>15%</td>
                           <td>20%</td>
                           <td>25%</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
               <div className="sep5"></div>
               <div className="text-desc text-small">{t(L.TrialRunDesc)}</div>
               <div className="separator" />
               <div className="row text-strong">
                  <div className="f1">{t(L.ThisRun)}</div>
                  {gs.isOffline ? null : <div className="m-icon small mr5 text-green">verified_user</div>}
                  <div>{gs.isOffline ? t(L.ThisRunTrial) : t(L.ThisRunPermanent)}</div>
               </div>
            </>
         ) : (
            <div className="text-small text-link mt5" onClick={() => setShowDetails(true)}>
               {t(L.AccountTypeShowDetails)}
            </div>
         )}
      </fieldset>
   );
}
