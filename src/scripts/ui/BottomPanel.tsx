import type React from "react";
import { GameStateChanged } from "../../../shared/logic/GameStateLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { cls, sizeOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { OnSceneChanged } from "../utilities/SceneManager";
import { Singleton, isSingletonReady } from "../utilities/Singleton";
import { playClick } from "../visuals/Sound";

export function BottomPanel(): React.ReactNode {
   refreshOnTypedEvent(OnSceneChanged);
   refreshOnTypedEvent(GameStateChanged);
   if (!isSingletonReady()) return null;
   return (
      <div className="row">
         <button
            onClick={() => {
               playClick();
               Singleton().sceneManager.loadScene(WorldScene);
            }}
            className={cls(Singleton().sceneManager.isCurrent(WorldScene) ? "active" : null, "nowrap")}
         >
            {t(L.CityViewMap)}
         </button>
         <button
            id="tutorial-research-button"
            className={cls(Singleton().sceneManager.isCurrent(TechTreeScene) ? "active" : null, "nowrap")}
            onClick={() => {
               playClick();
               Singleton().sceneManager.loadScene(TechTreeScene);
            }}
         >
            {t(L.ResearchMenu)}
         </button>
         {sizeOf(Tick.current.playerTradeBuildings) <= 0 ? null : (
            <button
               className={cls(Singleton().sceneManager.isCurrent(PlayerMapScene) ? "active" : null, "nowrap")}
               onClick={() => {
                  playClick();
                  Singleton().sceneManager.loadScene(PlayerMapScene);
               }}
            >
               {t(L.PlayerMapMenuShort)}
            </button>
         )}
      </div>
   );
}
