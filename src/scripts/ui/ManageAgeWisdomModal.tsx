import { Config } from "../../../shared/logic/Config";
import { numberToRoman } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { getColorCached } from "../utilities/CachedColor";
import { jsxMapOf } from "../utilities/Helper";
import { Fonts } from "../visuals/Fonts";
import { hideModal } from "./GlobalModal";

export function ManageAgeWisdomModal(): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className="window" style={{ width: "700px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.ManageAgeWisdom)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <div className="inset-shallow white" style={{ maxHeight: "50vh", overflowY: "auto" }}>
               {jsxMapOf(Config.TechAge, (age, def) => {
                  if (def.idx === 0) {
                     return null;
                  }
                  const wisdomLevel = options.ageWisdom[age] ?? 0;
                  const nextWisdomLevel = wisdomLevel + 1;
                  const color = getColorCached(def.color).toHex();
                  return (
                     <div
                        className="row"
                        style={{
                           fontFamily: Fonts.Platypi,
                           borderColor: color,
                           borderWidth: "2px",
                           borderStyle: "solid",
                           padding: 10,
                           margin: 10,
                           fontSize: 16,
                           color: color,
                           borderRadius: 5,
                        }}
                     >
                        <div>
                           ({numberToRoman(def.idx + 1)}) {def.name()}
                        </div>
                        <div className="f1"></div>
                        <div className="mr10">{t(L.LevelX, { level: wisdomLevel })}</div>
                        <button>{t(L.Upgrade)}</button>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
}
