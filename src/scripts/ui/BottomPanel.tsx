import type React from "react";
import { cls, sizeOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { OnSceneChanged } from "../utilities/SceneManager";
import { Singleton, isSingletonReady } from "../utilities/Singleton";
import { playClick } from "../visuals/Sound";
import { Tick } from "../../../shared/logic/TickLogic";

export function BottomPanel(): React.ReactNode {
   if (!isSingletonReady()) return null;
   refreshOnTypedEvent(OnSceneChanged);
   return (
      <div className="row">
         <button
            onClick={() => {
               playClick();
               Singleton().sceneManager.loadScene(WorldScene);
            }}
            className={cls(Singleton().sceneManager.isCurrent(WorldScene) ? "active" : null)}
         >
            {t(L.CityViewMap)}
         </button>
         <button
            className={cls(Singleton().sceneManager.isCurrent(TechTreeScene) ? "active" : null)}
            onClick={() => {
               playClick();
               Singleton().sceneManager.loadScene(TechTreeScene);
            }}
         >
            {t(L.ResearchMenu)}
         </button>
         {sizeOf(Tick.current.playerTradeBuildings) <= 0 ? null : (
            <button
               className={cls(Singleton().sceneManager.isCurrent(PlayerMapScene) ? "active" : null)}
               onClick={() => {
                  playClick();
                  Singleton().sceneManager.loadScene(PlayerMapScene);
               }}
            >
               {t(L.PlayerMapMenu)}
            </button>
         )}
      </div>
   );
}
