import { MAX_TECH_COLUMN, type Tech } from "../../../shared/definitions/TechDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getGreatPeopleChoiceCount, rollGreatPeopleThisRun } from "../../../shared/logic/RebirthLogic";
import {
   checkItsukushimaShrine,
   getCurrentAge,
   getScienceAmount,
   getTechUnlockCost,
   getTotalTechUnlockCost,
   tryDeductScience,
   unlockTech,
} from "../../../shared/logic/TechLogic";
import { forEach } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { checkAgeAchievements } from "../logic/Achievement";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playAgeUp, playUpgrade } from "../visuals/Sound";
import { ChooseGreatPersonModal } from "./ChooseGreatPersonModal";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { InDevelopmentPage } from "./InDevelopmentPage";
import { MenuComponent } from "./MenuComponent";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { UnlockableEffectComponent } from "./UnlockableEffectComponent";

export function TechPage({ id }: { id: Tech }): React.ReactNode {
   const gs = useGameState();
   const tech = Config.Tech[id];
   const goBackToCity = () => Singleton().sceneManager.loadScene(WorldScene);
   const isTechAvailable = () => {
      return tech.column <= MAX_TECH_COLUMN;
   };
   const unlock = () => {
      if (!isTechAvailable() || !canUnlock() || gs.unlockedTech[id]) {
         return;
      }
      const { totalScience, prerequisites } = getTotalTechUnlockCost(id, gs);
      if (!tryDeductScience(totalScience, gs)) {
         return;
      }

      prerequisites.push(id);
      prerequisites.forEach((tech) => {
         const oldAge = getCurrentAge(gs);
         unlockTech(tech, true, gs);
         const newAge = getCurrentAge(gs);
         if (oldAge && newAge && oldAge !== newAge) {
            forEach(Config.TechAge, (age, def) => {
               if (def.idx <= Config.TechAge[newAge].idx) {
                  const candidates = rollGreatPeopleThisRun(age, gs.city, getGreatPeopleChoiceCount(gs));
                  if (candidates) {
                     gs.greatPeopleChoicesV2.push(candidates);
                  }
               }
            });
            if (gs.unlockedUpgrades.Communism5) {
               for (let i = 0; i < 2; i++) {
                  const candidates = rollGreatPeopleThisRun(newAge, gs.city, getGreatPeopleChoiceCount(gs));
                  if (candidates) {
                     gs.greatPeopleChoicesV2.push(candidates);
                  }
               }
            }
            checkAgeAchievements(newAge);
         }

         checkItsukushimaShrine(tech, gs);
      });

      if (gs.greatPeopleChoicesV2.length > 0) {
         playAgeUp();
         showModal(<ChooseGreatPersonModal permanent={false} />);
      } else {
         playUpgrade();
      }
      notifyGameStateUpdate();
      Singleton().sceneManager.getCurrent(TechTreeScene)?.renderTechTree("animate", true);
   };

   useShortcut("TechPageGoBackToCity", goBackToCity, [id]);
   useShortcut("TechPageUnlockTech", unlock, [id]);

   if (!isTechAvailable()) {
      return <InDevelopmentPage />;
   }

   const unlockScienceCost = getTechUnlockCost(id);
   const availableScience = getScienceAmount(gs);
   const { prerequisites, totalScience } = getTotalTechUnlockCost(id, gs);
   const canUnlock = () => availableScience >= totalScience;

   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">
               {t(L.UnlockBuilding)}: {tech.name()}
            </div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <button className="w100 row jcc mb10" onClick={goBackToCity}>
               <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
                  arrow_back
               </div>
               <div className="f1">{t(L.BackToCity)}</div>
            </button>
            <fieldset>
               <legend>{t(L.Science)}</legend>
               {gs.unlockedTech[id] ? (
                  <div className="row">
                     <div className="m-icon small mr5 text-green">check_circle</div>
                     <div className="f1 text-strong">{t(L.TechHasBeenUnlocked, { tech: tech.name() })}</div>
                     <div className="text-desc">
                        <FormatNumber value={unlockScienceCost} />
                     </div>
                  </div>
               ) : (
                  <>
                     <ul className="tree-view">
                        <li className="row text-strong">
                           <div className="f1">{tech.name()}</div>
                           <div className="ml20">
                              <FormatNumber value={getTechUnlockCost(id)} />
                           </div>
                        </li>
                        <ul>
                           {prerequisites.map((tech) => {
                              return (
                                 <li key={tech} className="row text-small">
                                    <div className="f1">{Config.Tech[tech].name()}</div>
                                    <div>
                                       <FormatNumber value={getTechUnlockCost(tech)} />
                                    </div>
                                 </li>
                              );
                           })}
                        </ul>
                        <li className="row text-strong">
                           <div className="f1">{t(L.TotalScienceRequired)}</div>
                           {availableScience >= totalScience ? (
                              <div className="m-icon small ml20 mr5 text-green">check_circle</div>
                           ) : (
                              <div className="m-icon small ml20 mr5 text-red">cancel</div>
                           )}
                           <div>
                              <FormatNumber value={availableScience} />
                              {" / "}
                              <FormatNumber value={totalScience} />
                           </div>
                        </li>
                     </ul>
                     <div className="sep5" />
                     <div className="row">
                        <div className="f1">
                           <ProgressBarComponent progress={availableScience / totalScience} />
                        </div>
                        <div style={{ width: "10px" }} />
                        <button disabled={!canUnlock()} onClick={() => unlock()}>
                           {t(L.UnlockBuilding)}
                        </button>
                     </div>
                  </>
               )}
            </fieldset>
            <UnlockableEffectComponent definition={tech} gameState={gs} />
         </div>
      </div>
   );
}
