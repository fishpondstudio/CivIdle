import Tippy from "@tippyjs/react";
import { useState } from "react";
import { Config } from "../../../shared/logic/Config";
import {
   MAX_TARIFF_RATE,
   TRADE_TILE_ALLY_BONUS,
   TRADE_TILE_NEIGHBOR_BONUS,
} from "../../../shared/logic/Constants";
import { UserAttributes, UserColorsMapping } from "../../../shared/utilities/Database";
import { formatPercent, hasFlag, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { AccountLevelNames } from "../logic/AccountLevel";
import {
   OnTileBuildingsChanged,
   TileBuildings,
   client,
   isAllyWith,
   usePlayerMap,
   useUser,
} from "../rpc/RPCClient";
import { getNeighboringPlayers } from "../scenes/PathFinder";
import { getCountryName } from "../utilities/CountryCode";
import { jsxMMapOf } from "../utilities/Helper";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { showToast } from "./GlobalModal";
import { MapTileBonusComponent } from "./MapTileBonusComponent";
import { MenuComponent } from "./MenuComponent";
import { PlayerHandleComponent } from "./PlayerHandleComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { AccountLevelComponent, PlayerFlagComponent, SupporterComponent } from "./TextureSprites";
import { TitleBarComponent } from "./TitleBarComponent";
import { WarningComponent } from "./WarningComponent";

export function MyTilePage({ xy }: { xy: string }): React.ReactNode {
   refreshOnTypedEvent(OnTileBuildingsChanged);
   const playerMap = usePlayerMap();
   const [tariffRate, setTariffRate] = useState(playerMap.get(xy)?.tariffRate ?? 0);
   const neighbors = getNeighboringPlayers();
   const user = useUser();
   return (
      <div className="window">
         <TitleBarComponent>{t(L.PlayerMapYourTile)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <MapTileBonusComponent xy={xy} />
            <PlayerHandleComponent />
            <fieldset>
               <legend>{t(L.PlayerMapSetYourTariff)}</legend>
               <div className="row">
                  <div className="f1">{t(L.PlayerMapTariff)}</div>
                  <div className="text-strong">{formatPercent(tariffRate)}</div>
               </div>
               <div className="sep5"></div>
               <input
                  type="range"
                  min={0}
                  max={100 * 100 * MAX_TARIFF_RATE}
                  step="10"
                  value={tariffRate * 100 * 100}
                  onChange={(e) => {
                     setTariffRate(safeParseInt(e.target.value) / 100 / 100);
                  }}
               />
               <div className="sep20"></div>
               <div className="text-desc text-small">{t(L.PlayerMapTariffDesc)}</div>
               <div className="sep10"></div>
               <button
                  className="w100 row jcc"
                  disabled={tariffRate === playerMap.get(xy)?.tariffRate}
                  onClick={async () => {
                     try {
                        await client.setTariffRate(tariffRate);
                     } catch (error) {
                        showToast(String(error));
                     }
                  }}
               >
                  <div className="m-icon small mr5">cached</div>
                  <div>{t(L.PlayerMapTariffApply)}</div>
               </button>
            </fieldset>
            <fieldset>
               <legend>{t(L.Neighbors)}</legend>
               <WarningComponent icon="info" className="mb10 text-small">
                  <RenderHTML
                     html={t(L.NeighborsDescHTML, {
                        neighbor: TRADE_TILE_NEIGHBOR_BONUS,
                        ally: TRADE_TILE_ALLY_BONUS,
                     })}
                  />
               </WarningComponent>
               <ul className="tree-view">
                  {jsxMMapOf(neighbors, (userId, entries) => {
                     const tile = entries[0][1];
                     const isAlly = isAllyWith(tile);
                     return (
                        <li key={userId}>
                           <div className="row">
                              <div
                                 className="text-strong mr5"
                                 style={{ color: UserColorsMapping[tile.color] }}
                              >
                                 {tile.handle}
                              </div>
                              <Tippy content={getCountryName(tile.flag)}>
                                 <PlayerFlagComponent name={tile.flag} scale={0.7} />
                              </Tippy>
                              <Tippy content={AccountLevelNames[tile.level]()}>
                                 <AccountLevelComponent level={tile.level} scale={0.17} />
                              </Tippy>
                              {hasFlag(tile.attr, UserAttributes.DLC1) ? (
                                 <Tippy content={t(L.AccountSupporter)}>
                                    <SupporterComponent scale={0.17} />
                                 </Tippy>
                              ) : null}
                              <div className="f1"></div>
                              {isAlly ? (
                                 <>
                                    <div className="m-icon text-green small">handshake</div>
                                    <div className="text-green text-strong">{t(L.Ally)}</div>
                                 </>
                              ) : (
                                 <Tippy content={t(L.BecomeAllyTooltip)}>
                                    <div className="text-desc text-strong">{t(L.Neighbor)}</div>
                                 </Tippy>
                              )}
                           </div>
                           <ul>
                              {entries.map(([xy, entry]) => {
                                 const building = TileBuildings.get(xy);
                                 if (!building) return null;
                                 return (
                                    <li className="row" key={xy}>
                                       <div className="f1">{Config.Building[building].name()}</div>
                                       <div>
                                          +{isAlly ? TRADE_TILE_ALLY_BONUS : TRADE_TILE_NEIGHBOR_BONUS}
                                       </div>
                                    </li>
                                 );
                              })}
                           </ul>
                        </li>
                     );
                  })}
               </ul>
            </fieldset>
         </div>
      </div>
   );
}
