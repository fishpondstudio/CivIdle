import classNames from "classnames";
import React from "react";
import { ChatChannels } from "../../../server/src/Database";
import { notifyGameOptionsUpdate, useGameOptions } from "../Global";
import { jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playError } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";

export function SelectChatChannelModal(): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.ChatChannel)}</div>
            <div className="title-bar-controls">
               <button aria-label="Close" onClick={() => hideModal()}></button>
            </div>
         </div>
         <div className="window-body">
            <div className="table-view">
               <table>
                  <tbody>
                     <tr>
                        <th>{t(L.ChatChannelLanguage)}</th>
                        <th>{t(L.ChatChannelSend)}</th>
                        <th>{t(L.ChatChannelReceive)}</th>
                     </tr>
                     {jsxMapOf(ChatChannels, (channel, value) => {
                        return (
                           <tr key={channel}>
                              <td className="f1">{value}</td>
                              <td>
                                 <div
                                    className={classNames({
                                       "m-icon small pointer": true,
                                       "text-green": options.chatSendChannel === channel,
                                       "text-desc": options.chatSendChannel !== channel,
                                    })}
                                    onClick={() => {
                                       options.chatSendChannel = channel;
                                       options.chatReceiveChannel[channel] = true;
                                       notifyGameOptionsUpdate(options);
                                    }}
                                 >
                                    {options.chatSendChannel === channel
                                       ? "check_circle"
                                       : "radio_button_unchecked"}
                                 </div>
                              </td>
                              <td>
                                 <div
                                    className={classNames({
                                       "m-icon pointer": true,
                                       "text-desc": !options.chatReceiveChannel[channel],
                                       "text-green": options.chatReceiveChannel[channel],
                                    })}
                                    onClick={() => {
                                       if (options.chatReceiveChannel[channel]) {
                                          if (channel === options.chatSendChannel) {
                                             playError();
                                          } else {
                                             delete options.chatReceiveChannel[channel];
                                          }
                                       } else {
                                          options.chatReceiveChannel[channel] = true;
                                       }
                                       notifyGameOptionsUpdate(options);
                                    }}
                                 >
                                    {options.chatReceiveChannel[channel] ? "toggle_on" : "toggle_off"}
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
