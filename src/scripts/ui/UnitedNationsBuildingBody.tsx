import { default as Tippy } from "@tippyjs/react";
import { Fragment, useEffect, useState } from "react";
import { Config } from "../../../shared/logic/Config";
import { getVotingTime } from "../../../shared/logic/PlayerTradeLogic";
import type { IGetVotedBoostResponse } from "../../../shared/utilities/Database";
import { formatHMS, isNullOrUndefined } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { client } from "../rpc/RPCClient";
import { SteamClient, isSteam } from "../rpc/SteamClient";
import { playError, playUpgrade } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { showToast } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";
import { BuildingSpriteComponent } from "./TextureSprites";
import { UpgradeableWonderComponent } from "./UpgradeableWonderComponent";

export function UnitedNationsBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   const [response, setResponse] = useState<IGetVotedBoostResponse | null>(null);
   const options = useGameOptions();
   if (!building) {
      return null;
   }
   useEffect(() => {
      client.getVotedBoosts().then(setResponse);
   }, []);

   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
         {isNullOrUndefined(response) ? null : (
            <>
               <fieldset>
                  <legend>{t(L.UNGeneralAssemblyCurrent, { id: response.id })}</legend>
                  <RenderHTML
                     html={t(L.UNGeneralAssemblyMultipliersV2, {
                        count: 5,
                        buildings: response.current.options[response.current.voted].buildings
                           .map((b) => Config.Building[b].name())
                           .join(", "),
                     })}
                  />
                  <div className="row g10 mt5">
                     {response.current.options[response.current.voted].buildings.map((building) => {
                        return (
                           <Tippy key={building} content={Config.Building[building].name()}>
                              <BuildingSpriteComponent
                                 building={building}
                                 scale={(0.25 * options.sidePanelWidth) / 450}
                                 style={{ filter: "invert(0.75)" }}
                              />
                           </Tippy>
                        );
                     })}
                  </div>
               </fieldset>
               <fieldset>
                  <legend>{t(L.UNGeneralAssemblyNext, { id: response.id + 1 })}</legend>
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
                                          setResponse(await client.voteBoosts(idx));
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
                                 <RenderHTML
                                    html={t(L.UNGeneralAssemblyMultipliersV2, {
                                       count: 5,
                                       buildings: op.buildings
                                          .map((b) => Config.Building[b].name())
                                          .join(", "),
                                    })}
                                 />
                                 <div className="row g10 mt5" style={{ overflow: "auto", width: "100%" }}>
                                    {op.buildings.map((building) => {
                                       return (
                                          <Tippy key={building} content={Config.Building[building].name()}>
                                             <BuildingSpriteComponent
                                                building={building}
                                                scale={(0.25 * options.sidePanelWidth) / 450}
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
         )}
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
