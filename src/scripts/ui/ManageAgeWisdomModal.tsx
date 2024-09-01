import Tippy from "@tippyjs/react";
import { Config } from "../../../shared/logic/Config";
import { getMissingGreatPeopleForWisdom } from "../../../shared/logic/RebirthLogic";
import { numberToRoman } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { getColorCached } from "../utilities/CachedColor";
import { jsxMMapOf, jsxMapOf } from "../utilities/Helper";
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
                  const missing = getMissingGreatPeopleForWisdom(age);
                  return (
                     <div
                        className="row"
                        style={{
                           fontFamily: Fonts.OldTypefaces,
                           borderColor: color,
                           borderWidth: "2px",
                           borderStyle: "solid",
                           padding: 10,
                           margin: 10,
                           fontSize: 20,
                           color: color,
                           borderRadius: 5,
                        }}
                     >
                        <div>
                           ({numberToRoman(def.idx + 1)}) {def.name()}
                        </div>
                        <div className="f1"></div>
                        <div className="mr10">{t(L.LevelX, { level: wisdomLevel })}</div>
                        <button disabled={missing.size > 0}>
                           <Tippy
                              disabled={missing.size <= 0}
                              content={
                                 <div>
                                    <div className="text-strong">{t(L.AgeWisdomMissingGreatPeopleLevel)}</div>
                                    {jsxMMapOf(missing, (gp, amount) => {
                                       return (
                                          <div className="row">
                                             <div className="f1">{Config.GreatPerson[gp].name()}</div>
                                             <div className="ml20">{amount}</div>
                                          </div>
                                       );
                                    })}
                                 </div>
                              }
                           >
                              <div>{t(L.Upgrade)}</div>
                           </Tippy>
                        </button>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
}
