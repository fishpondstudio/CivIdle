import { useEffect, useState } from "react";
import { AccountLevel } from "../../../shared/utilities/Database";
import { forEach, shuffle } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { AccountLevelNames } from "../logic/AccountLevel";
import { client } from "../rpc/RPCClient";
import { Fonts } from "../visuals/Fonts";
import { toRem } from "../utilities/UIScaling";
import { hideModal } from "./GlobalModal";
import { AccountLevelComponent } from "./TextureSprites";

export function HallOfFameModal(): React.ReactNode {
   const [data, setData] = useState<Partial<Record<AccountLevel, string[]>>>();
   useEffect(() => {
      client.getHallOfFame().then((data) => {
         forEach(data, (k, v) => {
            shuffle(v);
         });
         setData(data);
      });
   }, []);
   return (
      <div className="window modal-window" style={{ width: "80rem" }}>
         <div className="title-bar">
            <div className="title-bar-text">{$t(L.HallOfFame)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body" style={{ height: "60rem" }}>
            <div>
               {[
                  AccountLevel.Augustus,
                  AccountLevel.Caesar,
                  AccountLevel.Consul,
                  AccountLevel.Praetor,
                  AccountLevel.Aedile,
               ].map((level) => {
                  return (
                     <fieldset key={level}>
                        <legend className="row text-strong" style={{ fontSize: "2rem" }}>
                           <AccountLevelComponent
                              level={level}
                              scale={0.5}
                              style={{ marginRight: "0.5rem" }}
                           />
                           {AccountLevelNames[level]()} ({data?.[level]?.length ?? 0})
                        </legend>
                        <div
                           style={{
                              fontFamily: Fonts.OldTypefaces,
                              fontSize: toRem(9 + 3 * level),
                              color: `rgb(${150 - 25 * level},${150 - 25 * level},${150 - 25 * level})`,
                           }}
                        >
                           {data?.[level]?.map((f) => (
                              <span key={f}>{f} </span>
                           ))}
                        </div>
                     </fieldset>
                  );
               })}
            </div>
         </div>
      </div>
   );
}
