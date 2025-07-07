import Tippy from "@tippyjs/react";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import { mapSafeAdd } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { OnPlayerMapChanged, getPlayerMap } from "../rpc/RPCClient";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { getCountryName } from "../utilities/CountryCode";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { OnSceneChanged } from "../utilities/SceneManager";
import { Singleton, isSingletonReady } from "../utilities/Singleton";
import { PlayerFlagComponent } from "./TextureSprites";

const flagRanking = new Map<string, number>();

function updateFlagRanking(): void {
   flagRanking.clear();
   const map = getPlayerMap();
   for (const entry of map.values()) {
      if (entry.flag) {
         mapSafeAdd(flagRanking, entry.flag, 1);
      }
   }
}

export function TradeMapPanel(): React.ReactNode {
   refreshOnTypedEvent(OnSceneChanged);
   refreshOnTypedEvent(OnPlayerMapChanged);
   updateFlagRanking();
   if (!isSingletonReady()) {
      return null;
   }
   if (!Singleton().sceneManager.isCurrent(PlayerMapScene)) {
      return null;
   }
   return (
      <div
         style={{ position: "absolute", top: 0, right: getGameOptions().sidePanelWidth }}
         className="window"
      >
         <Tippy content={t(L.PlayerMapRankingDesc)}>
            <div className="title-bar">
               <div className="title-bar-text">{t(L.PlayerMapRanking)}</div>
            </div>
         </Tippy>
         <div
            style={{
               padding: "5px",
               backgroundColor: "#fff",
               display: "flex",
               flexDirection: "column",
               gap: "5px 0",
            }}
         >
            {Array.from(flagRanking.entries())
               .sort((a, b) => b[1] - a[1])
               .slice(0, 20)
               .map(([flag, count], i) => (
                  <Tippy content={getCountryName(flag)} key={flag}>
                     <div className="row">
                        <div style={{ width: 20 }} className="text-strong">
                           {i + 1}
                        </div>
                        <PlayerFlagComponent name={flag} scale={0.7} />
                        <div className="f1 ml10 text-right text-desc">{count}</div>
                     </div>
                  </Tippy>
               ))}
         </div>
      </div>
   );
}
