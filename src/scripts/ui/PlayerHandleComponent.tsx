import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { Config } from "../../../shared/logic/Config";
import { TRIBUNE_TRADE_VALUE_PER_MINUTE, TRIBUNE_UPGRADE_PLAYTIME } from "../../../shared/logic/Constants";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import {
   getRebirthGreatPeopleCount,
   getTribuneUpgradeMaxLevel,
   upgradeAllPermanentGreatPeople,
} from "../../../shared/logic/RebornLogic";
import { AccountLevel, TradeTileReservationDays, UserAttributes } from "../../../shared/utilities/Database";
import { forEach, formatHM, hasFlag, sizeOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import Supporter from "../../images/Supporter.png";
import { resetToCity, saveGame, useGameState } from "../Global";
import { AccountLevelImages, AccountLevelNames } from "../logic/AccountLevel";
import { client, useUser } from "../rpc/RPCClient";
import { getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { playClick, playError, playLevelUp } from "../visuals/Sound";
import { AlertModal } from "./AlertModal";
import { ChangePlayerHandleModal } from "./ChangePlayerHandleModal";
import { ConfirmModal } from "./ConfirmModal";
import { showModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { WarningComponent } from "./WarningComponent";

export function PlayerHandleComponent() {
   const user = useUser();
   const gs = useGameState();
   const [showDetails, setShowDetails] = useState(false);
   const accountLevel = user?.level ?? AccountLevel.Tribune;
   return (
      <fieldset>
         <legend>{t(L.PlayerHandle)}</legend>
         {user == null ? (
            <div className="text-strong">{t(L.PlayerHandleOffline)}</div>
         ) : (
            <>
               <div className="row">
                  <div className="text-strong">{user?.handle}</div>
                  <Tippy content={getCountryName(user?.flag)}>
                     <img className="ml5 player-flag" src={getFlagUrl(user?.flag)} />
                  </Tippy>
                  {hasFlag(user.attr, UserAttributes.DLC1) ? (
                     <Tippy content={t(L.AccountSupporter)}>
                        <img className="ml5 player-flag" src={Supporter} />
                     </Tippy>
                  ) : null}
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
               <div className="sep5" />
               <div className="row text-strong">
                  <div className="f1">{t(L.AccountLevel)}</div>
                  <img
                     src={AccountLevelImages[accountLevel]}
                     alt={AccountLevelNames[accountLevel]()}
                     className="player-level mr5"
                  />
                  <div>{AccountLevelNames[accountLevel]()}</div>
               </div>
            </>
         )}
         {showDetails ? (
            <AccountDetails />
         ) : (
            <div className="row text-link mt5" onClick={() => setShowDetails(true)}>
               {t(L.AccountTypeShowDetails)}
            </div>
         )}
      </fieldset>
   );
}

function AccountDetails(): React.ReactNode {
   const [playTime, setPlayTime] = useState(0);
   const user = useUser();
   useEffect(() => {
      (async () => {
         if (user?.level === AccountLevel.Tribune) {
            setPlayTime(await client.getPlayTime());
         }
      })();
   }, [user]);
   const cond1 = playTime * 1000 > TRIBUNE_UPGRADE_PLAYTIME;
   const cond2 = hasFlag(user?.attr ?? 0, UserAttributes.DLC1);
   const noPendingGreatPerson = () =>
      getRebirthGreatPeopleCount() +
         sizeOf(getGameState().greatPeople) +
         getGameState().greatPeopleChoices.length +
         getGameOptions().greatPeopleChoices.length <=
      0;
   return (
      <>
         <div className="separator" />
         <div className="table-view">
            <table>
               <tbody>
                  <tr>
                     <th></th>
                     <th>
                        <TextWithHelp content={AccountLevelNames[AccountLevel.Tribune]()} noStyle>
                           <img className="player-level" src={AccountLevelImages[AccountLevel.Tribune]} />
                        </TextWithHelp>
                     </th>
                     <th>
                        <TextWithHelp content={AccountLevelNames[AccountLevel.Quaestor]()} noStyle>
                           <img className="player-level" src={AccountLevelImages[AccountLevel.Quaestor]} />
                        </TextWithHelp>
                     </th>
                     <th>
                        <TextWithHelp content={AccountLevelNames[AccountLevel.Aedile]()} noStyle>
                           <img className="player-level" src={AccountLevelImages[AccountLevel.Aedile]} />
                        </TextWithHelp>
                     </th>
                     <th>
                        <TextWithHelp content={AccountLevelNames[AccountLevel.Praetor]()} noStyle>
                           <img className="player-level" src={AccountLevelImages[AccountLevel.Praetor]} />
                        </TextWithHelp>
                     </th>
                     <th>
                        <TextWithHelp content={AccountLevelNames[AccountLevel.Consul]()} noStyle>
                           <img className="player-level" src={AccountLevelImages[AccountLevel.Consul]} />
                        </TextWithHelp>
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
                     <td>{t(L.AccountActiveTrade)}</td>
                     <td>2</td>
                     <td>4</td>
                     <td>6</td>
                     <td>8</td>
                     <td>10</td>
                  </tr>
                  <tr>
                     <td>{t(L.AccountTradeValuePerMinute)}</td>
                     <td>
                        <FormatNumber value={TRIBUNE_TRADE_VALUE_PER_MINUTE} />
                     </td>
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
                  <tr>
                     <td>
                        <TextWithHelp content={t(L.AccountTradeTileReservationTimeDesc)}>
                           {t(L.AccountTradeTileReservationTime)}
                        </TextWithHelp>
                     </td>
                     <td>{TradeTileReservationDays[AccountLevel.Tribune]}d</td>
                     <td>{TradeTileReservationDays[AccountLevel.Quaestor]}d</td>
                     <td>{TradeTileReservationDays[AccountLevel.Aedile]}d</td>
                     <td>{TradeTileReservationDays[AccountLevel.Praetor]}d</td>
                     <td>{TradeTileReservationDays[AccountLevel.Consul]}d</td>
                  </tr>
               </tbody>
            </table>
         </div>
         <div className="sep5"></div>
         {user?.level === AccountLevel.Tribune ? (
            <>
               <div className="separator" />
               <WarningComponent className="mb10" icon="info">
                  <RenderHTML className="text-small" html={t(L.TribuneUpgradeDescV3)} />
               </WarningComponent>
               <RenderHTML html={t(L.AccountLevelUpgradeConditionAnyHTML)} />
               <div className="separator" />
               <div className="row">
                  <div className="f1">
                     {t(L.AccountLevelPlayTime, {
                        requiredTime: formatHM(TRIBUNE_UPGRADE_PLAYTIME),
                        actualTime: formatHM(playTime * 1000),
                     })}
                  </div>
                  <div
                     className={classNames({
                        "m-icon small ml10": true,
                        "text-green": cond1,
                        "text-none": !cond1,
                     })}
                  >
                     check_circle
                  </div>
               </div>
               <div className="separator" />
               <div className="row">
                  <div className="f1">{t(L.AccountLevelSupporterPack)}</div>
                  <div
                     className={classNames({
                        "m-icon small ml10": true,
                        "text-green": cond2,
                        "text-none": !cond2,
                     })}
                  >
                     check_circle
                  </div>
               </div>
               <div className="separator" />
               <button
                  className="w100 text-strong row"
                  disabled={!cond1 && !cond2}
                  onClick={() => {
                     playClick();
                     if (!noPendingGreatPerson()) {
                        showModal(
                           <AlertModal title={t(L.TribuneUpgradeDescGreatPeopleWarningTitle)}>
                              <RenderHTML html={t(L.TribuneUpgradeDescGreatPeopleWarning)} />
                           </AlertModal>,
                        );
                        return;
                     }
                     showModal(
                        <ConfirmModal
                           title={t(L.AccountUpgradeConfirm)}
                           onConfirm={async () => {
                              try {
                                 await client.upgrade();
                                 playLevelUp();
                                 resetToCity(getGameState().city);
                                 getGameOptions().greatPeopleChoices = [];
                                 upgradeAllPermanentGreatPeople(getGameOptions());
                                 forEach(getGameOptions().greatPeople, (k, v) => {
                                    const maxLevel = getTribuneUpgradeMaxLevel(Config.GreatPerson[k].age);
                                    if (v.level >= maxLevel) {
                                       v.level = maxLevel;
                                       v.amount = 0;
                                    }
                                 });
                                 await saveGame();
                                 window.location.reload();
                              } catch (error) {
                                 playError();
                                 showToast(String(error));
                              }
                           }}
                        >
                           <RenderHTML html={t(L.AccountUpgradeConfirmDescV2)} />
                        </ConfirmModal>,
                     );
                  }}
               >
                  <div className="m-icon small">vpn_lock</div>
                  <div className="f1 text-center">{t(L.AccountUpgradeButton)}</div>
               </button>
            </>
         ) : null}
      </>
   );
}
