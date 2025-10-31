import Tippy from "@tippyjs/react";
import { useState } from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { Config } from "../../../shared/logic/Config";
import { TRADE_TILE_BONUS } from "../../../shared/logic/Constants";
import { GameStateChanged } from "../../../shared/logic/GameStateLogic";
import { getVotingTime } from "../../../shared/logic/PlayerTradeLogic";
import { formatHMS } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { OnTileBuildingsChanged, TileBuildings } from "../rpc/RPCClient";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { WorldScene } from "../scenes/WorldScene";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { showModal } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";
import { BuildingSpriteComponent } from "./TextureSprites";
import { TradeMapStatModal } from "./TradeMapStatModal";
import { WarningComponent } from "./WarningComponent";

export function MapTileBonusComponent({ xy }: { xy: string }): React.ReactNode {
   refreshOnTypedEvent(OnTileBuildingsChanged);
   const building = TileBuildings.get(xy);
   const [showMore, setShowMore] = useState(false);
   if (!building) {
      return null;
   }
   return (
      <>
         <button className="w100 row jcc mb5" onClick={() => Singleton().sceneManager.loadScene(WorldScene)}>
            <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
               arrow_back
            </div>
            <div className="f1">{t(L.BackToCity)}</div>
         </button>
         <button className="w100 row jcc mb10" onClick={() => showModal(<TradeMapStatModal />)}>
            <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
               insights
            </div>
            <div className="f1">{t(L.TradeMapStatistics)}</div>
         </button>
         <TileBonusRefreshTime />
         <fieldset>
            <legend>{t(L.PlayerMapMapTileBonus)}</legend>
            <div className="row inset-shallow white ph10 pv5">
               <div className="f1 text-strong">{Config.Building[building].name()}</div>
               <div className="mr10">
                  +{TRADE_TILE_BONUS} {t(L.ProductionMultiplier)}
               </div>
               <BuildingSpriteComponent
                  building={building}
                  scale={0.4}
                  style={{ filter: "invert(0.75)", marginLeft: 10 }}
               />
            </div>
            <div className="row mt10">
               <button
                  style={{ padding: "0 5px" }}
                  onClick={() => {
                     Singleton().sceneManager.getCurrent(PlayerMapScene)?.lookAtPrevious(xy);
                  }}
               >
                  <div className="m-icon">arrow_left</div>
               </button>
               <button
                  className="f1"
                  onClick={() => {
                     Singleton()
                        .sceneManager.getCurrent(PlayerMapScene)
                        ?.highlightBuildings(new Set([building]));
                  }}
               >
                  {t(L.HighlightBuilding, { building: Config.Building[building].name() })}
               </button>
               <button
                  style={{ padding: "0 5px" }}
                  onClick={() => {
                     Singleton().sceneManager.getCurrent(PlayerMapScene)?.lookAtNext(xy);
                  }}
               >
                  <div className="m-icon">arrow_right</div>
               </button>
            </div>
            <div className="separator" />
            {showMore ? (
               <>
                  <button className="w100 row jcc mb10 p0" onClick={() => setShowMore(false)}>
                     <div className="f1">{t(L.HighlightMoreBuildings)}</div>
                     <div className="m-icon">arrow_drop_up</div>
                  </button>
                  <HighlightBuildings />
               </>
            ) : (
               <button className="w100 row jcc p0" onClick={() => setShowMore(true)}>
                  <div className="f1">{t(L.HighlightMoreBuildings)}</div>
                  <div className="m-icon">arrow_drop_down</div>
               </button>
            )}
         </fieldset>
      </>
   );
}

function HighlightBuildings(): React.ReactNode {
   const [highlighted, setHighlighted] = useState<Set<Building>>(new Set());
   const buildings = new Set(TileBuildings.values());
   return (
      <div
         className="inset-shallow-2 white"
         style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2 }}
      >
         {Array.from(buildings)
            .sort((a, b) => (Config.BuildingTier[a] ?? 0) - (Config.BuildingTier[b] ?? 0))
            .map((building) => {
               return (
                  <Tippy key={building} content={Config.Building[building].name()}>
                     <div
                        className="row jcc"
                        onClick={() => {
                           if (highlighted.has(building)) {
                              highlighted.delete(building);
                           } else {
                              highlighted.add(building);
                           }
                           setHighlighted(new Set(highlighted));
                           Singleton()
                              .sceneManager.getCurrent(PlayerMapScene)
                              ?.highlightBuildings(highlighted);
                        }}
                        style={{
                           backgroundColor: highlighted.has(building) ? "#00289e" : "transparent",
                        }}
                     >
                        <BuildingSpriteComponent
                           building={building}
                           height={36}
                           style={{
                              filter: highlighted.has(building) ? "invert(0)" : "invert(0.5)",
                              margin: "5px 0",
                           }}
                        />
                     </div>
                  </Tippy>
               );
            })}
      </div>
   );
}

function TileBonusRefreshTime(): React.ReactNode {
   refreshOnTypedEvent(GameStateChanged);
   return (
      <WarningComponent className="mb10" icon="info">
         <RenderHTML html={t(L.TileBonusRefreshIn, { time: formatHMS(getVotingTime()) })} />
      </WarningComponent>
   );
}
