import Tippy from "@tippyjs/react";
import { Config } from "../../../shared/logic/Config";
import { GameStateChanged } from "../../../shared/logic/GameStateLogic";
import {
   MaxTilePointTime,
   TilePointPerHour,
   getTileFromAccountRank,
} from "../../../shared/logic/PlayerTradeLogic";
import { AccountLevel, MoveTileCooldown, UserAttributes } from "../../../shared/utilities/Database";
import {
   DAY,
   HOUR,
   clamp,
   formatHMS,
   formatNumber,
   hasFlag,
   xyToPoint,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { client, getPlayerMap, getUser, usePlayerMap, useUser } from "../rpc/RPCClient";
import { getOwnedOrOccupiedTiles, getOwnedTradeTile } from "../scenes/PathFinder";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { playError, playSuccess } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";

export function ClaimTileComponent({ xy }: { xy: string }): React.ReactNode {
   refreshOnTypedEvent(GameStateChanged);
   const playerMap = usePlayerMap();
   const myXy = getOwnedTradeTile();
   const user = useUser();
   let cooldownLeft = MoveTileCooldown;
   if (!myXy) {
      cooldownLeft = 0;
   } else {
      const tile = playerMap.get(myXy);
      cooldownLeft += tile!.createdAt - Date.now();
   }
   const fromRank = getTileFromAccountRank(user?.level ?? AccountLevel.Tribune);
   const fromOccupying = getTileFromOccupying();
   const myTiles = getOwnedOrOccupiedTiles();
   return (
      <>
         <fieldset>
            <legend>{t(L.PlayerMapClaimThisTile)}</legend>
            <div className="row mv5">
               {hasFlag(user?.attr ?? UserAttributes.None, UserAttributes.Banned) ? (
                  <div className="m-icon small mr10 text-red">cancel</div>
               ) : (
                  <div className="m-icon small mr10 text-green">check_circle</div>
               )}
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
               disabled={cooldownLeft > 0}
               className="w100 row jcc"
               onClick={async () => {
                  try {
                     await client.claimTile(xy);
                     playSuccess();
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
         <fieldset>
            <legend>{t(L.PlayerMapOccupyThisTile)}</legend>
            <div className="row mv5">
               {user && isAdjacentToOwnedOrOccupiedTile(user.userId, xy) ? (
                  <div className="m-icon small mr10 text-green">check_circle</div>
               ) : (
                  <div className="m-icon small mr10 text-red">cancel</div>
               )}
               <div className="f1">{t(L.PlayerMapOccupyTileCondition1)}</div>
            </div>
            <ul className="tree-view">
               <li>
                  <li className="row">
                     <div className="f1 text-strong">{t(L.PlayerMapTileTilePoint)}</div>
                     <div className="text-strong">{formatNumber(fromRank + fromOccupying)}</div>
                  </li>
                  <ul>
                     <li className="row">
                        <div className="f1">{t(L.PlayerMapTileFromRank)}</div>
                        <div>{formatNumber(fromRank)}</div>
                     </li>
                     <li className="row">
                        <div>{t(L.PlayerMapTileFromOccupying)}</div>
                        <Tippy
                           content={
                              <RenderHTML
                                 html={t(L.PlayerMapTileFromOccupyingTooltipHTML, {
                                    point: TilePointPerHour,
                                    max: Math.round(MaxTilePointTime / DAY),
                                 })}
                              />
                           }
                        >
                           <div className="m-icon small ml5 text-desc">info</div>
                        </Tippy>

                        <div className="f1" />
                        <div>{formatNumber(fromOccupying)}</div>
                     </li>
                  </ul>
               </li>

               <li className="row">
                  <div className="text-strong">{t(L.PlayerMapTileUsedTilePoint)}</div>
                  <Tippy
                     content={
                        <RenderHTML
                           html={t(L.PlayerMapTileUsedTilePointTooltipHTML, { point: TilePointPerHour })}
                        />
                     }
                  >
                     <div className="m-icon small ml5 text-desc">info</div>
                  </Tippy>

                  <div className="f1" />
                  <div className="text-strong">{formatNumber(myTiles.length)}</div>
               </li>
               <li className="row">
                  <div className="f1 text-strong">{t(L.PlayerMapTileAvailableTilePoint)}</div>
                  <div className="text-strong">{formatNumber(fromRank + fromOccupying - myTiles.length)}</div>
               </li>
            </ul>
            <div className="separator" />
            <button
               disabled={
                  !user ||
                  !isAdjacentToOwnedOrOccupiedTile(user.userId, xy) ||
                  myTiles.length + 1 > fromRank + fromOccupying
               }
               className="w100 row jcc"
               onClick={async () => {
                  try {
                     await client.occupyTile(xy);
                     playSuccess();
                  } catch (error) {
                     playError();
                     showToast(String(error));
                  }
               }}
            >
               <div className="m-icon small mr5">swords</div>
               <div className="text-strong f1">{t(L.PlayerMapOccupyThisTile)}</div>
            </button>
         </fieldset>
      </>
   );
}

function isAdjacentToOwnedOrOccupiedTile(userId: string, xy: string): boolean {
   const playerMap = getPlayerMap();
   const point1 = xyToPoint(xy);
   for (const [key, value] of playerMap) {
      const point2 = xyToPoint(key);
      if (value.userId === userId && Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y) <= 1) {
         return true;
      }
   }
   return false;
}

export function getTileFromOccupying(): number {
   let time = 0;
   const playerMap = getPlayerMap();
   const userId = getUser()?.userId;
   if (!userId) return 0;

   let now = Date.now();
   playerMap.forEach((entry, xy) => {
      if (entry.userId === userId) {
         now = Math.min(now, entry.createdAt + 7 * DAY);
      }
   });

   playerMap.forEach((entry, xy) => {
      if (entry.userId === userId) {
         time += clamp(now - entry.createdAt, 0, MaxTilePointTime);
      }
   });
   return (time * TilePointPerHour) / HOUR;
}
