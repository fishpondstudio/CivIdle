import classNames from "classnames";
import React, { useTransition } from "react";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { ChatChannels } from "../../../shared/utilities/Database";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { jsxMapOf } from "../utilities/Helper";
import { playError } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";

export function SelectChatChannelModal(): React.ReactNode {
   const options = useGameOptions();
   const [isPending, startTransition] = useTransition();
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
                        <th style={{ width: 0 }}></th>
                     </tr>
                     {jsxMapOf(ChatChannels, (channel, value) => {
                        return (
                           <tr key={channel}>
                              <td className="f1">{value}</td>
                              <td>
                                 <div
                                    className={classNames({
                                       "m-icon pointer": true,
                                       "text-desc": !options.chatChannels.has(channel),
                                       "text-green": options.chatChannels.has(channel),
                                    })}
                                    onClick={() => {
                                       if (options.chatChannels.has(channel)) {
                                          if (options.chatChannels.size <= 1) {
                                             playError();
                                             return;
                                          }
                                          options.chatChannels.delete(channel);
                                       } else {
                                          options.chatChannels.add(channel);
                                       }
                                       startTransition(() => notifyGameOptionsUpdate(options));
                                    }}
                                 >
                                    {options.chatChannels.has(channel) ? "toggle_on" : "toggle_off"}
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
