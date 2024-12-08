import { useEffect, useState } from "react";
import { AccountLevel } from "../../../shared/utilities/Database";
import { forEach, shuffle } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { AccountLevelImages, AccountLevelNames } from "../logic/AccountLevel";
import { client } from "../rpc/RPCClient";
import { Fonts } from "../visuals/Fonts";
import { hideModal } from "./GlobalModal";

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
      <div className="window" style={{ width: 800, maxWidth: "80vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.HallOfFame)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div style={{ overflowY: "auto", height: 600, maxHeight: "80vh" }}>
            <div className="window-body">
               {[AccountLevel.Consul, AccountLevel.Praetor, AccountLevel.Aedile].map((level) => {
                  return (
                     <fieldset key={level}>
                        <legend className="row text-strong">
                           <img src={AccountLevelImages[level]} style={{ width: 20 }} className="mr5" />
                           {AccountLevelNames[level]()} ({data?.[level]?.length ?? 0})
                        </legend>
                        <div
                           style={{
                              fontFamily: Fonts.OldTypefaces,
                              fontSize: 9 + 3 * level,
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
