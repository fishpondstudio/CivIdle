import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { MAX_TECH_COLUMN, type Tech } from "../../../shared/definitions/TechDefinitions";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { rollGreatPeopleThisRun } from "../../../shared/logic/RebornLogic";
import { getResourceAmount, trySpendResources } from "../../../shared/logic/ResourceLogic";
import { OnResetTile, getCurrentTechAge, getUnlockCost, unlockTech } from "../../../shared/logic/TechLogic";
import { forEach, reduceOf } from "../../../shared/utilities/Helper";
import type { PartialTabulate } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { checkAgeAchievements } from "../logic/Achievement";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { jsxMapOf } from "../utilities/Helper";
import { useShortcut } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playLevelUp } from "../visuals/Sound";
import { ChooseGreatPersonModal } from "./ChooseGreatPersonModal";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { InDevelopmentPage } from "./InDevelopmentPage";
import { MenuComponent } from "./MenuComponent";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { TechPrerequisiteItemComponent } from "./TechComponent";
import { UnlockableEffectComponent } from "./UnlockableEffectComponent";

export function TechPage({ id }: { id: Tech }): React.ReactNode {
   const gs = useGameState();
   const tech = Config.Tech[id];
   const goBackToCity = () => Singleton().sceneManager.loadScene(WorldScene);
   const isTechAvailable = () => {
      return tech.column <= MAX_TECH_COLUMN;
   };
   const unlock = () => {
      if (!isTechAvailable() || !canUnlock()) {
         return;
      }
      if (!trySpendResources(unlockCost, gs)) {
         return;
      }
      playLevelUp();
      const oldAge = getCurrentTechAge(gs);
      unlockTech(id, OnResetTile, gs);
      const newAge = getCurrentTechAge(gs);
      if (oldAge && newAge && oldAge !== newAge) {
         forEach(Config.TechAge, (age, def) => {
            if (def.idx <= Config.TechAge[newAge].idx) {
               const candidates = rollGreatPeopleThisRun(age);
               if (candidates) {
                  gs.greatPeopleChoices.push(candidates);
               }
            }
         });
         checkAgeAchievements(newAge);
      }
      if (gs.greatPeopleChoices.length > 0) {
         showModal(<ChooseGreatPersonModal permanent={false} />);
      }
      notifyGameStateUpdate();
      Singleton().sceneManager.getCurrent(TechTreeScene)?.renderTechTree("animate", true);
   };

   useShortcut("TechPageGoBackToCity", goBackToCity, [id]);
   useShortcut("TechPageUnlockTech", unlock, [id]);

   if (!isTechAvailable()) {
      return <InDevelopmentPage />;
   }

   const prerequisitesSatisfied = tech.requireTech.every((t) => gs.unlockedTech[t]);
   const unlockCost: PartialTabulate<Resource> = { Science: getUnlockCost(id) };
   const availableResources: PartialTabulate<Resource> = {};
   forEach(unlockCost, (k, v) => {
      availableResources[k] = getResourceAmount(k, gs);
   });
   const progress =
      reduceOf(availableResources, (prev, k, v) => prev + Math.min(v, unlockCost[k] ?? 0), 0) /
      reduceOf(unlockCost, (prev, _, v) => prev + v, 0);
   const canUnlock = () => prerequisitesSatisfied && progress >= 1 && !gs.unlockedTech[id];

   let prerequisiteCount = 0;
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
               <legend>{t(L.TechnologyPrerequisite)}</legend>
               {tech.requireTech?.map((prerequisite) => {
                  prerequisiteCount++;
                  return (
                     <TechPrerequisiteItemComponent
                        key={prerequisite}
                        name={
                           <>
                              {t(L.UnlockBuilding)} <b>{Config.Tech[prerequisite].name()}</b>
                           </>
                        }
                        unlocked={!!gs.unlockedTech[prerequisite]}
                        action={() =>
                           Singleton()
                              .sceneManager.loadScene(TechTreeScene)
                              ?.selectNode(prerequisite, "animate", true)
                        }
                     />
                  );
               })}
               {prerequisiteCount === 0 ? <div>{t(L.TechnologyNoPrerequisite)}</div> : null}
            </fieldset>
            <fieldset>
               <legend>{t(L.Progress)}</legend>
               {gs.unlockedTech[id] ? (
                  <div className="row text-green">
                     <div className="m-icon small mr5">check_circle</div>
                     <div>{t(L.TechHasBeenUnlocked, { tech: tech.name() })}</div>
                  </div>
               ) : (
                  <>
                     {jsxMapOf(unlockCost, (res, cost) => {
                        const availableAmount = availableResources[res] ?? 0;
                        return (
                           <div className="row mv5" key={res}>
                              {availableAmount >= cost ? (
                                 <div className="m-icon small text-green mr5">check_circle</div>
                              ) : (
                                 <div className="m-icon small text-red mr5">cancel</div>
                              )}
                              <div className="mr5">{Config.Resource[res].name()}: </div>
                              <div className="f1" />
                              <div className="ml5">
                                 <FormatNumber value={availableAmount} /> /{" "}
                                 <strong>
                                    <FormatNumber value={cost} />
                                 </strong>
                              </div>
                           </div>
                        );
                     })}
                     <div className="sep5" />
                     <div className="row">
                        <div className="f1">
                           <ProgressBarComponent progress={progress} />
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
