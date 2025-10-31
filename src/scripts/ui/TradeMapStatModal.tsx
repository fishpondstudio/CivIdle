import type { City } from "../../../shared/definitions/CityDefinitions";
import type { TechAge } from "../../../shared/definitions/TechDefinitions";
import { Config } from "../../../shared/logic/Config";
import { mapSafeAdd } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { getPlayerMap } from "../rpc/RPCClient";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { getCountryName } from "../utilities/CountryCode";
import { Singleton, isSingletonReady } from "../utilities/Singleton";
import { hideModal } from "./GlobalModal";
import { PlayerFlagComponent } from "./TextureSprites";

export function TradeMapStatModal(): React.ReactNode {
   if (!isSingletonReady()) {
      return null;
   }
   if (!Singleton().sceneManager.isCurrent(PlayerMapScene)) {
      return null;
   }

   const flagRanking = new Map<string, number>();
   const cityRanking = new Map<City, number>();
   const techAgeRanking = new Map<TechAge, number>();
   const countedUserIds = new Set<string>();

   const map = getPlayerMap();
   for (const entry of map.values()) {
      if (countedUserIds.has(entry.userId)) {
         continue;
      }
      countedUserIds.add(entry.userId);
      if (entry.flag) {
         mapSafeAdd(flagRanking, entry.flag, 1);
      }
      if (entry.city) {
         mapSafeAdd(cityRanking, entry.city, 1);
      }
      if (entry.techAge) {
         if (entry.techAge === "StoneAge" || entry.techAge === "BronzeAge") {
            console.warn(`${entry.handle} has tech age ${entry.techAge}`);
         }
         mapSafeAdd(techAgeRanking, entry.techAge, 1);
      }
   }

   return (
      <div className="window" style={{ width: 700, maxWidth: "80vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.TradeMapStatistics)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div
            className="window-body"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}
         >
            <div className="inset-shallow white p10">
               <div className="text-desc mb10">{t(L.PlayerFlag)}</div>
               {Array.from(flagRanking.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 15)
                  .map(([flag, count], i) => (
                     <div className="row g5 mv5" key={flag}>
                        <div style={{ width: 20 }} className="text-strong">
                           {i + 1}
                        </div>
                        <PlayerFlagComponent name={flag} scale={0.7} />
                        <div className="f1 text-strong">{getCountryName(flag)}</div>
                        <div>{count}</div>
                     </div>
                  ))}
            </div>
            <div className="inset-shallow white p10">
               <div className="text-desc mb10">{t(L.Civilization)}</div>
               {Array.from(cityRanking.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([city, count], i) => (
                     <div className="row g5 mv5" key={city}>
                        <div style={{ width: 20 }} className="text-strong">
                           {i + 1}
                        </div>
                        <div className="f1 text-strong">{Config.City[city].name()}</div>
                        <div>{count}</div>
                     </div>
                  ))}
            </div>
            <div className="inset-shallow white p10">
               <div className="text-desc mb10">{t(L.TechAge)}</div>
               {Array.from(techAgeRanking.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([techAge, count], i) => (
                     <div className="row g5 mv5" key={techAge}>
                        <div style={{ width: 20 }} className="text-strong">
                           {i + 1}
                        </div>
                        <div className="f1 text-strong">{Config.TechAge[techAge].name()}</div>
                        <div>{count}</div>
                     </div>
                  ))}
            </div>
         </div>
      </div>
   );
}
