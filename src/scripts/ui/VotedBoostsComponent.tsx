import Tippy from "@tippyjs/react";
import { useEffect, useState } from "react";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import { getVotingTime } from "../../../shared/logic/PlayerTradeLogic";
import type { IGetVotedBoostResponse, IVotedBoostOption } from "../../../shared/utilities/Database";
import { cls, formatHMS, isNullOrUndefined } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { isSteam, SteamClient } from "../rpc/SteamClient";
import { playError, playUpgrade } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";
import { BuildingSpriteComponent } from "./TextureSprites";
import { WarningComponent } from "./WarningComponent";

export function VotedBoostsComponent({
   currentVoteTitle,
   nextVoteTitle,
   description,
   getVotedBoosts,
   voteBoosts,
}: {
   currentVoteTitle: (id: number) => React.ReactNode;
   nextVoteTitle: (id: number) => React.ReactNode;
   description: React.ReactNode;
   getVotedBoosts: () => Promise<IGetVotedBoostResponse>;
   voteBoosts: (idx: number) => Promise<IGetVotedBoostResponse>;
}): React.ReactNode {
   const [response, setResponse] = useState<IGetVotedBoostResponse | null>(null);
   useEffect(() => {
      getVotedBoosts().then(setResponse);
   }, [getVotedBoosts]);
   if (isNullOrUndefined(response)) {
      return null;
   }
   return (
      <>
         <fieldset>
            <legend>{currentVoteTitle(response.id)}</legend>
            <div className="table-view">
               <table>
                  <tbody>
                     {response.current.options.map((op, idx) => {
                        return (
                           <tr key={idx} style={{ opacity: idx === response.current.voted ? 1 : 0.5 }}>
                              <td>
                                 <div className={cls(idx === response.current.voted ? "text-strong" : null)}>
                                    {op.count}
                                 </div>
                                 {idx === response.current.voted && (
                                    <div className="m-icon text-green">check_circle</div>
                                 )}
                              </td>
                              <td>
                                 <VotedBoostsOptionComp data={op} />
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </fieldset>
         <WarningComponent icon="info" className="mb10 text-small">
            {description}
         </WarningComponent>
         <fieldset>
            <legend>{nextVoteTitle(response.id + 1)}</legend>
            <div className="table-view">
               <table>
                  <tbody>
                     {response.next.options.map((op, idx) => {
                        return (
                           <tr key={idx} style={{ opacity: idx === response.next.voted ? 1 : 0.5 }}>
                              <td>
                                 {response.next.voted === idx ? (
                                    <div className="m-icon text-green">check_box</div>
                                 ) : (
                                    <div
                                       className="m-icon text-desc pointer"
                                       onClick={async () => {
                                          try {
                                             setResponse(await voteBoosts(idx));
                                             if (isSteam()) {
                                                SteamClient.unlockAchievement("WorldsDelegate");
                                             }
                                             playUpgrade();
                                          } catch (error) {
                                             playError();
                                             showToast(String(error));
                                          }
                                       }}
                                    >
                                       check_box_outline_blank
                                    </div>
                                 )}
                              </td>
                              <td>
                                 <VotedBoostsOptionComp data={op} />
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
            <div className="separator"></div>
            <RenderHTML
               className="text-small text-desc"
               html={$t(L.UNGeneralAssemblyVoteEndIn, { time: formatHMS(getVotingTime()) })}
            />
         </fieldset>
      </>
   );
}

function VotedBoostsOptionComp({ data }: { data: IVotedBoostOption }): React.ReactNode {
   return (
      <>
         <div className="text-strong">{data.buildings.map((b) => Config.Building[b].name()).join(", ")}</div>
         <div className="row g10 mt5" style={{ overflow: "auto", width: "100%" }}>
            {data.buildings.map((building) => {
               return (
                  <Tippy key={building} content={Config.Building[building].name()}>
                     <BuildingSpriteComponent
                        building={building}
                        scale={(0.24 * getGameOptions().sidePanelWidth) / 450}
                        style={{ filter: "invert(0.75)" }}
                     />
                  </Tippy>
               );
            })}
         </div>
      </>
   );
}
