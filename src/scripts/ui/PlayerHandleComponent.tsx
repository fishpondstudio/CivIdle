import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { Config } from "../../../shared/logic/Config";
import { TRIBUNE_TRADE_VALUE_PER_MINUTE } from "../../../shared/logic/Constants";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import {
   getRebirthGreatPeopleCount,
   getTribuneUpgradeMaxLevel,
   upgradeAllPermanentGreatPeople,
} from "../../../shared/logic/RebirthLogic";
import {
   AccountLevel,
   AccountLevelGreatPeopleLevel,
   AccountLevelPlayTime,
   TradeTileReservationDays,
   UserAttributes,
   UserColorsMapping,
   type UserColors,
} from "../../../shared/utilities/Database";
import { HOUR, forEach, formatHM, hasFlag, safeParseInt, sizeOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { resetToCity, saveGame } from "../Global";
import { AccountLevelNames } from "../logic/AccountLevel";
import { useEligibleAccountRank } from "../logic/ClientUpdate";
import { OnUserChanged, client, useUser } from "../rpc/RPCClient";
import { getCountryName } from "../utilities/CountryCode";
import { jsxMMapOf } from "../utilities/Helper";
import { openUrl } from "../utilities/Platform";
import { playClick, playError, playLevelUp } from "../visuals/Sound";
import { AccountRankUpModal } from "./AccountRankUpModal";
import { AlertModal } from "./AlertModal";
import { ChangePlayerHandleModal } from "./ChangePlayerHandleModal";
import { ConfirmModal } from "./ConfirmModal";
import { showModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { AccountLevelComponent, PlayerFlagComponent, SupporterComponent } from "./TextureSprites";
import { WarningComponent } from "./WarningComponent";

export function PlayerHandleComponent() {
   const user = useUser();
   const eligibleRank = useEligibleAccountRank();
   const [showDetails, setShowDetails] = useState(false);
   const accountLevel = user?.level ?? AccountLevel.Tribune;
   return (
      <fieldset>
         <legend>{t(L.PlayerHandle)}</legend>
         {hasFlag(user?.attr ?? UserAttributes.None, UserAttributes.TribuneOnly) ? (
            <WarningComponent
               icon="error"
               className="mb10"
               onClick={() =>
                  openUrl("https://steamcommunity.com/app/2181940/discussions/0/6629936675071563255/")
               }
            >
               <RenderHTML className="text-small" html={t(L.AntiCheatFailure)} />
            </WarningComponent>
         ) : null}
         {user == null ? (
            <div className="text-strong">{t(L.PlayerHandleOffline)}</div>
         ) : (
            <>
               {eligibleRank > user.level ? (
                  <WarningComponent
                     icon="info"
                     className="mb10 text-small text-strong"
                     onClick={() => {
                        playClick();
                        showModal(<AccountRankUpModal rank={eligibleRank} user={user} />);
                     }}
                  >
                     {t(L.AccountRankUpTip)}
                  </WarningComponent>
               ) : null}

               <div className="row">
                  <div style={{ color: UserColorsMapping.get(user.color) }} className="text-strong">
                     {user.handle}
                  </div>
                  <Tippy content={getCountryName(user?.flag)}>
                     <PlayerFlagComponent name={user.flag} style={{ marginLeft: 5 }} scale={0.75} />
                  </Tippy>
                  {hasFlag(user.attr, UserAttributes.DLC1) ? (
                     <Tippy content={t(L.AccountSupporter)}>
                        <SupporterComponent scale={0.18} />
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
               <div className="row text-strong mt5">
                  <div className="f1">{t(L.AccountLevel)}</div>
                  <AccountLevelComponent level={accountLevel} scale={0.15} style={{ marginRight: 5 }} />
                  <div>{AccountLevelNames[accountLevel]()}</div>
               </div>
               {hasFlag(user.attr, UserAttributes.DLC1) ? (
                  <div className="row text-strong mt5">
                     <div className="f1">{t(L.AccountCustomColor)}</div>
                     <select
                        value={user.color}
                        onChange={async (e) => {
                           try {
                              const color = safeParseInt(e.target.value, 0) as UserColors;
                              user.color = color;
                              OnUserChanged.emit({ ...user });
                              OnUserChanged.emit(await client.changeColor(color));
                           } catch (error) {
                              showToast(String(error));
                              playError();
                           }
                        }}
                        className="condensed code"
                        style={{ color: UserColorsMapping.get(user.color) }}
                     >
                        {jsxMMapOf(UserColorsMapping, (key, color) => {
                           return (
                              <option className="code" style={{ color }} value={key} key={key}>
                                 {color ?? t(L.AccountCustomColorDefault)}
                              </option>
                           );
                        })}
                     </select>
                  </div>
               ) : null}
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
   const cond1 = playTime * 1000 > AccountLevelPlayTime[AccountLevel.Quaestor];
   const cond2 = hasFlag(user?.attr ?? 0, UserAttributes.DLC1);
   const noPendingGreatPerson = () =>
      getRebirthGreatPeopleCount() +
         sizeOf(getGameState().greatPeople) +
         getGameState().greatPeopleChoicesV2.length +
         getGameOptions().greatPeopleChoicesV2.length <=
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
                           <AccountLevelComponent level={AccountLevel.Tribune} scale={0.2} />
                        </TextWithHelp>
                     </th>
                     <th>
                        <TextWithHelp content={AccountLevelNames[AccountLevel.Quaestor]()} noStyle>
                           <AccountLevelComponent level={AccountLevel.Quaestor} scale={0.2} />
                        </TextWithHelp>
                     </th>
                     <th>
                        <TextWithHelp content={AccountLevelNames[AccountLevel.Aedile]()} noStyle>
                           <AccountLevelComponent level={AccountLevel.Aedile} scale={0.2} />
                        </TextWithHelp>
                     </th>
                     <th>
                        <TextWithHelp content={AccountLevelNames[AccountLevel.Praetor]()} noStyle>
                           <AccountLevelComponent level={AccountLevel.Praetor} scale={0.2} />
                        </TextWithHelp>
                     </th>
                     <th>
                        <TextWithHelp content={AccountLevelNames[AccountLevel.Consul]()} noStyle>
                           <AccountLevelComponent level={AccountLevel.Consul} scale={0.2} />
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
                  </tr>{" "}
                  <tr>
                     <td>{t(L.AccountPlayTimeRequirement)}</td>
                     <td>-</td>
                     <td>{AccountLevelPlayTime[AccountLevel.Quaestor] / HOUR}h</td>
                     <td>{AccountLevelPlayTime[AccountLevel.Aedile] / HOUR}h</td>
                     <td>{AccountLevelPlayTime[AccountLevel.Praetor] / HOUR}h</td>
                     <td>{AccountLevelPlayTime[AccountLevel.Consul] / HOUR}h</td>
                  </tr>{" "}
                  <tr>
                     <td>{t(L.AccountGreatPeopleLevelRequirement)}</td>
                     <td>-</td>
                     <td>{AccountLevelGreatPeopleLevel[AccountLevel.Quaestor]}</td>
                     <td>{AccountLevelGreatPeopleLevel[AccountLevel.Aedile]}</td>
                     <td>{AccountLevelGreatPeopleLevel[AccountLevel.Praetor]}</td>
                     <td>{AccountLevelGreatPeopleLevel[AccountLevel.Consul]}</td>
                  </tr>
               </tbody>
            </table>
         </div>
         <div className="sep5"></div>
         {user?.level === AccountLevel.Tribune ? (
            <>
               <div className="separator" />
               <WarningComponent className="mb10" icon="info">
                  <RenderHTML className="text-small" html={t(L.TribuneUpgradeDescV4)} />
               </WarningComponent>
               <RenderHTML html={t(L.AccountLevelUpgradeConditionAnyHTML)} />
               <div className="separator" />
               <div className="row text-small">
                  <div className="f1">
                     {t(L.AccountLevelPlayTime, {
                        requiredTime: formatHM(AccountLevelPlayTime[AccountLevel.Quaestor]),
                        actualTime: formatHM(playTime * 1000),
                     })}
                  </div>
                  {cond1 ? (
                     <div className="m-icon small ml10 text-green">check_circle</div>
                  ) : (
                     <div className="m-icon small ml10 text-red">cancel</div>
                  )}
               </div>
               <div className="separator" />
               <div className="row text-small">
                  <div className="f1">{t(L.AccountLevelSupporterPack)}</div>
                  {cond2 ? (
                     <div className="m-icon small ml10 text-green">check_circle</div>
                  ) : (
                     <div className="m-icon small ml10 text-red">cancel</div>
                  )}
               </div>
               <div className="separator" />
               <button
                  className="w100 text-strong row"
                  disabled={!cond1 && !cond2}
                  onClick={() => {
                     playClick();
                     if (!noPendingGreatPerson()) {
                        playError();
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
                                 await resetToCity(getGameState().city);
                                 const options = getGameOptions();
                                 options.greatPeopleChoicesV2 = [];
                                 upgradeAllPermanentGreatPeople(options);
                                 forEach(options.greatPeople, (k, v) => {
                                    const maxLevel = getTribuneUpgradeMaxLevel(Config.GreatPerson[k].age);
                                    if (v.level >= maxLevel) {
                                       v.level = maxLevel;
                                       v.amount = 0;
                                    }
                                 });
                                 options.ageWisdom = {};
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
