import Tippy from "@tippyjs/react";
import { Config } from "../../../shared/logic/Config";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import {
   getGreatPeopleForWisdom,
   getMissingGreatPeopleForWisdom,
   getWisdomUpgradeCost,
} from "../../../shared/logic/RebirthLogic";
import { numberToRoman, safeAdd } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { isOnlineUser } from "../rpc/RPCClient";
import { getColorCached } from "../utilities/CachedColor";
import { jsxMMapOf, jsxMapOf } from "../utilities/Helper";
import { Fonts } from "../visuals/Fonts";
import { playError, playLevelUp } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";

export function ManageAgeWisdomModal(): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className="window" style={{ width: "500px" }}>
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
                        <button
                           disabled={missing.size > 0}
                           onClick={() => {
                              const missing = getMissingGreatPeopleForWisdom(age);
                              if (missing.size > 0) {
                                 playError();
                                 return;
                              }
                              playLevelUp();
                              getGreatPeopleForWisdom(age).forEach((gp) => {
                                 const inv = options.greatPeople[gp];
                                 if (inv) {
                                    inv.amount -= getWisdomUpgradeCost(gp);
                                 }
                              });
                              safeAdd(options.ageWisdom, age, 1);
                              notifyGameOptionsUpdate();
                           }}
                        >
                           <Tippy
                              disabled={missing.size <= 0 || !isOnlineUser()}
                              content={
                                 <div>
                                    <div className="text-strong">
                                       {t(L.AgeWisdomNeedMoreGreatPeopleShards)}
                                    </div>
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
