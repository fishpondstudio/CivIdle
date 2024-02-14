import { Config } from "../../../shared/logic/Config";
import { GameStateChanged } from "../../../shared/logic/GameStateLogic";
import { MoveTileCooldown } from "../../../shared/utilities/Database";
import { formatHMS } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { client, usePlayerMap } from "../rpc/RPCClient";
import { getMyMapXy } from "../scenes/PathFinder";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { playError } from "../visuals/Sound";
import { showToast } from "./GlobalModal";

export function ClaimTileComponent({ xy }: { xy: string }): React.ReactNode {
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
      <fieldset>
         <legend>{t(L.PlayerMapClaimThisTile)}</legend>
         <div className="row mv5">
            <div className="m-icon small mr10 text-green">check_circle</div>
            <div className="f1">{t(L.PlayerMapClaimTileCondition2)}</div>
         </div>
         <div className="row mv5">
            <div className="m-icon small mr10 text-green">check_circle</div>
            <div className="f1">
               {t(L.PlayerMapClaimTileCondition3, { tech: Config.Tech.LandTrade.name() })}
            </div>
         </div>
         <div className="row mv5">
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
         <div className="separator" />
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
            <div className="text-strong f1">{t(L.PlayerMapClaimThisTile)}</div>
         </button>
      </fieldset>
   );
}
