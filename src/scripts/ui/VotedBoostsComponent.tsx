import Tippy from "@tippyjs/react";
import { useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { Config } from "../../../shared/logic/Config";
import { getVotingTime } from "../../../shared/logic/PlayerTradeLogic";
import type { IGetVotedBoostResponse } from "../../../shared/utilities/Database";
import { formatHMS, isNullOrUndefined } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
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
   const options = useGameOptions();
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
            <div className="text-strong">
               {response.current.options[response.current.voted].buildings
                  .map((b) => Config.Building[b].name())
                  .join(", ")}
            </div>
            <div className="row g10 mt5">
               {response.current.options[response.current.voted].buildings.map((building) => {
                  return (
                     <Tippy key={building} content={Config.Building[building].name()}>
                        <BuildingSpriteComponent
                           building={building}
                           scale={(0.24 * options.sidePanelWidth) / 450}
                           style={{ filter: "invert(0.75)" }}
                        />
                     </Tippy>
                  );
               })}
            </div>
         </fieldset>
         <WarningComponent icon="info" className="mb10 text-small">
            {description}
         </WarningComponent>
         <fieldset>
            <legend>{nextVoteTitle(response.id + 1)}</legend>
            {response.next.options.map((op, idx) => {
               return (
                  <Fragment key={idx}>
                     <div className="row g10">
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
                        <div className="f1">
                           <div className="text-strong">
                              {op.buildings.map((b) => Config.Building[b].name()).join(", ")}
                           </div>
                           <div className="row g10 mt5" style={{ overflow: "auto", width: "100%" }}>
                              {op.buildings.map((building) => {
                                 return (
                                    <Tippy key={building} content={Config.Building[building].name()}>
                                       <BuildingSpriteComponent
                                          building={building}
                                          scale={(0.24 * options.sidePanelWidth) / 450}
                                          style={{ filter: "invert(0.75)" }}
                                       />
                                    </Tippy>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                     <div className="separator"></div>
                  </Fragment>
               );
            })}
            <RenderHTML
               className="text-small text-desc"
               html={t(L.UNGeneralAssemblyVoteEndIn, { time: formatHMS(getVotingTime()) })}
            />
         </fieldset>
      </>
   );
}
