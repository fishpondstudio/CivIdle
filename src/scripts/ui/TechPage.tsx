import { notifyGameStateUpdate, useGameState } from "../Global";
import { MAX_TECH_COLUMN } from "../SteamTesting";
import type { Resource } from "../definitions/ResourceDefinitions";
import type { Tech } from "../definitions/TechDefinitions";
import type { PartialTabulate } from "../definitions/TypeDefinitions";
import { Config } from "../logic/Config";
import { getResourceAmount, trySpendResources } from "../logic/ResourceLogic";
import { useShortcut } from "../logic/Shortcut";
import { getCurrentTechAge, getGreatPeopleChoices, getUnlockCost, unlockTech } from "../logic/TechLogic";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { forEach, jsxMapOf, reduceOf } from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
import { L, t } from "../utilities/i18n";
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

   useShortcut(
      "TechPageGoBackToCity",
      () => {
         Singleton().sceneManager.loadScene(WorldScene);
      },
      [id],
   );

   if (tech.column > MAX_TECH_COLUMN) {
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
               {/* {tech.requireProvince?.map((province) => {
                  prerequisiteCount++;
                  return (
                     <TechPrerequisiteItemComponent
                        key={province}
                        name={
                           <>
                              {t(L.Annex)} <b>{RomeProvince[province].name()}</b>
                           </>
                        }
                        unlocked={!!gs.unlockedProvince[province]}
                        action={() =>
                           Singleton().sceneManager.loadScene(RomeProvinceScene)?.selectProvince(province)
                        }
                     />
                  );
               })} */}
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
                        <button
                           disabled={!prerequisitesSatisfied || progress < 1}
                           onClick={() => {
                              if (!trySpendResources(unlockCost, gs)) {
                                 return;
                              }
                              const oldAge = getCurrentTechAge(gs);
                              unlockTech(id, gs);
                              playLevelUp();
                              const newAge = getCurrentTechAge(gs);
                              if (oldAge !== newAge) {
                                 gs.greatPeopleChoices.push(getGreatPeopleChoices(newAge!));
                              }
                              if (gs.greatPeopleChoices.length > 0) {
                                 showModal(
                                    <ChooseGreatPersonModal greatPeopleChoice={gs.greatPeopleChoices[0]} />,
                                 );
                              }
                              notifyGameStateUpdate();
                              Singleton()
                                 .sceneManager.getCurrent(TechTreeScene)
                                 ?.renderTechTree("animate", true);
                           }}
                        >
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
