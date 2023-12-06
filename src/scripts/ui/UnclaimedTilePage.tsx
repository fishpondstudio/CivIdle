import { MoveTileCooldown } from "../../../server/src/Database";
import { GameStateChanged } from "../Global";
import { Config } from "../logic/Constants";
import { client, usePlayerMap } from "../rpc/RPCClient";
import { getMyMapXy } from "../scenes/PathFinder";
import { formatHMS } from "../utilities/Helper";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { L, t } from "../utilities/i18n";
import { playError } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";

export function UnclaimedTilePage({ xy }: { xy: string }) {
   refreshOnTypedEvent(GameStateChanged);
   const playerMap = usePlayerMap();
   const myXy = getMyMapXy();
   let cooldownLeft = MoveTileCooldown;
   if (!myXy) {
      cooldownLeft = 0;
   } else {
      const tile = playerMap[myXy];
      cooldownLeft += tile.createdAt - Date.now();
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
                  <div className="f1">
                     {t(L.PlayerMapClaimTileCondition3, { tech: Config.Tech.LandTrade.name() })}
                  </div>
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
                        <div className="text-strong">
                           {t(L.PlayerMapClaimTileCooldownLeft, { time: formatHMS(cooldownLeft) })}
                        </div>
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
