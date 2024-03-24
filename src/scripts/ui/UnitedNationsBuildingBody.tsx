import { Fragment, useEffect, useState } from "react";
import { Config } from "../../../shared/logic/Config";
import { getVotingTime } from "../../../shared/logic/PlayerTradeLogic";
import type { IGetVotedBoostResponse } from "../../../shared/utilities/Database";
import { formatHMS, isNullOrUndefined } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { client } from "../rpc/RPCClient";
import { playBubble, playError } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { showToast } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";

export function UnitedNationsBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   const [response, setResponse] = useState<IGetVotedBoostResponse | null>(null);
   if (!building) {
      return null;
   }
   useEffect(() => {
      client.getVotedBoosts().then(setResponse);
   }, []);

   console.log(response);
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         {isNullOrUndefined(response) ? null : (
            <>
               <fieldset>
                  <legend>{t(L.UNGeneralAssemblyCurrent, { id: response.id })}</legend>
                  <RenderHTML
                     html={t(L.UNGeneralAssemblyMultipliers, {
                        count: 5,
                        buildings: response.current.options[response.current.voted].buildings
                           .map((b) => Config.Building[b].name())
                           .join(", "),
                     })}
                  />
               </fieldset>
               <fieldset>
                  <legend>{t(L.UNGeneralAssemblyNext, { id: response.id + 1 })}</legend>
                  {response.next.options.map((op, idx) => {
                     return (
                        <Fragment key={idx}>
                           <div
                              className="row pointer"
                              onClick={async () => {
                                 try {
                                    setResponse(await client.voteBoosts(idx));
                                    playBubble();
                                 } catch (error) {
                                    playError();
                                    showToast(String(error));
                                 }
                              }}
                           >
                              <RenderHTML
                                 html={t(L.UNGeneralAssemblyMultipliers, {
                                    count: 5,
                                    buildings: op.buildings.map((b) => Config.Building[b].name()).join(", "),
                                 })}
                              />
                              {response.next.voted === idx ? (
                                 <div className="m-icon ml20 text-green">check_box</div>
                              ) : (
                                 <div className="m-icon ml20 text-desc">check_box_outline_blank</div>
                              )}
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
         )}
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
