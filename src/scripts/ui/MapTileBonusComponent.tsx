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
import { RenderHTML } from "./RenderHTMLComponent";
import { BuildingSpriteComponent } from "./TextureSprites";
import { WarningComponent } from "./WarningComponent";

export function MapTileBonusComponent({ xy }: { xy: string }): React.ReactNode {
   refreshOnTypedEvent(OnTileBuildingsChanged);
   const building = TileBuildings.get(xy);
   if (!building) {
      return null;
   }
   return (
      <>
         <button className="w100 row jcc mb10" onClick={() => Singleton().sceneManager.loadScene(WorldScene)}>
            <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
               arrow_back
            </div>
            <div className="f1">{t(L.BackToCity)}</div>
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
                     Singleton().sceneManager.getCurrent(PlayerMapScene)?.highlightBuilding(building);
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
         </fieldset>
      </>
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
