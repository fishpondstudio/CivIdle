import { IMapEntry } from "../../../server/src/Database";
import { Tech } from "../definitions/TechDefinitions";
import { getGameOptions } from "../Global";
import { GameState } from "../logic/GameState";
import { client, usePlayerMap } from "../rpc/RPCClient";
import { DAY, forEach } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playError } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";

export function PlayerMapPage({ xy }: { xy: string }): JSX.Element | null {
   const playerMap = usePlayerMap();
   let myTileXy: string | null = null;
   let myTile: IMapEntry | null = null;

   forEach(playerMap, (xy, entry) => {
      if (entry.userId == getGameOptions().userId) {
         myTileXy = xy;
         myTile = entry;
      }
   });

   let cooldownLeft = 0;
   if (myTile) {
      cooldownLeft = Date.now() - (myTile as IMapEntry).createdAt + 7 * DAY;
   }

   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.PlayerMapUnclaimedTile)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <legend>{t(L.PlayerMapClaimThisTile)}</legend>
               <div className="row at">
                  <div className="m-icon small mr10 text-green">check_circle</div>
                  <div className="f1">{t(L.PlayerMapClaimTileCondition1)}</div>
               </div>
               <div className="separator"></div>
               <div className="row">
                  <div className="m-icon small mr10 text-green">check_circle</div>
                  <div className="f1">{t(L.PlayerMapClaimTileCondition2)}</div>
               </div>
               <div className="separator"></div>
               <div className="row">
                  <div className="m-icon small mr10 text-green">check_circle</div>
                  <div className="f1">{t(L.PlayerMapClaimTileCondition3, { tech: Tech.LandTrade.name() })}</div>
               </div>
               <div className="separator"></div>
               <div className="row">
                  {cooldownLeft > 0 ? (
                     <div className="m-icon small mr10 text-red">cancel</div>
                  ) : (
                     <div className="m-icon small mr10 text-green">check_circle</div>
                  )}
                  <div className="f1">
                     {t(L.PlayerMapClaimTileCondition4)}
                     {cooldownLeft > 0 ? (
                        <div className="text-strong">{t(L.PlayerMapClaimTileCooldownLeft, { time: cooldownLeft })}</div>
                     ) : null}
                  </div>
               </div>
            </fieldset>
            <button
               className="w100 row jcc"
               onClick={async () => {
                  try {
                     await client.claimTile(xy);
                  } catch (error) {
                     playError();
                     showToast(String(error));
                  }
               }}
            >
               <div className="m-icon small mr5">health_and_safety</div>
               <div className="text-strong">{t(L.PlayerMapClaimThisTile)}</div>
            </button>
         </div>
      </div>
   );
}

export interface IBuildingComponentProps {
   gameState: GameState;
   xy: string;
}
