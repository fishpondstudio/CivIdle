import { useEffect, useState } from "react";
import type { Achievement } from "../../../shared/utilities/SteamAchievement";
import { L, t } from "../../../shared/utilities/i18n";
import { client } from "../rpc/RPCClient";
import { jsxMapOf } from "../utilities/Helper";
import { MenuComponent } from "./MenuComponent";

export function SteamAchievementPage(): React.ReactNode {
   const [allAchievements, setAllAchievements] = useState<Record<string, Achievement>>({});
   const [achieved, setAchieved] = useState<Set<string>>(new Set());
   useEffect(() => {
      client.getAllAchievements().then(setAllAchievements);
      client.getAchievedAchievements().then((s) => setAchieved(new Set(s)));
   }, []);

   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Wonder)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            {jsxMapOf(allAchievements, (key, achievement) => {
               const hasAchieved = achieved.has(key);
               return (
                  <div key={key} className="inset-shallow white row p10">
                     <img
                        style={{ width: "50px", margin: "0 10px 0 0" }}
                        src={hasAchieved ? achievement.icon : achievement.iconDisabled}
                     />
                     <div className="f1">
                        <div className="text-strong">{achievement.name}</div>
                        <div className="text-desc text-small">{achievement.description}</div>
                     </div>
                     {hasAchieved ? (
                        <div className="m-icon ml10 text-green">verified</div>
                     ) : (
                        <div className="m-icon ml10 text-desc">cancel</div>
                     )}
                  </div>
               );
            })}
         </div>
      </div>
   );
}
