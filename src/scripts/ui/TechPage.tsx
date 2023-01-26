import { Unlockable } from "../definitions/CityDefinitions";
import { Resource } from "../definitions/ResourceDefinitions";
import { IRomeHistoryDefinitions } from "../definitions/RomeHistoryDefinitions";
import { PartialTabulate } from "../definitions/TypeDefinitions";
import { notifyGameStateUpdate, Singleton, useGameState } from "../Global";
import { Config } from "../logic/Constants";
import { onUnlockableUnlocked } from "../logic/LogicCallback";
import { getResourceAmount, trySpendResources } from "../logic/ResourceLogic";
import { getTechTree } from "../logic/TechLogic";
import { RomeProvinceScene } from "../scenes/RomeProvinceScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { forEach, jsxMapOf, reduceOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { FormatNumber } from "./HelperComponents";
import { MenuComponent } from "./MenuComponent";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { TechPrerequisiteItemComponent } from "./TechComponent";
import { UnlockableEffectComponent } from "./UnlockableEffectComponent";

export function TechPage({ id, type }: { id: string; type?: keyof typeof Unlockable }) {
   const gs = useGameState();
   const config = type ? Unlockable[type] : getTechTree(gs);
   const tech = id as keyof typeof config.definitions;
   const definition = config.definitions[tech];
   const prerequisitesSatisfied = definition.require.every((t) => gs.unlocked[t]);
   const unlockCost = config.unlockCost(tech);
   const availableResources: PartialTabulate<Resource> = {};
   forEach(unlockCost, (k, v) => {
      availableResources[k] = getResourceAmount(k, gs);
   });
   const progress =
      reduceOf(availableResources, (prev, k, v) => prev + Math.min(v, unlockCost[k] ?? 0), 0) /
      reduceOf(unlockCost, (prev, _, v) => prev + v, 0);
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">
               {config.verb()}: {definition.name()}
            </div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <legend>{t(L.TechnologyPrerequisite)}</legend>
               {definition.require.map((prerequisite) => {
                  return (
                     <TechPrerequisiteItemComponent
                        key={prerequisite}
                        name={
                           <>
                              {config.verb()}{" "}
                              <b>{config.definitions[prerequisite as keyof typeof config.definitions].name()}</b>
                           </>
                        }
                        unlocked={!!gs.unlocked[prerequisite]}
                        action={() =>
                           Singleton().sceneManager.loadScene(TechTreeScene)?.selectNode(prerequisite, "animate")
                        }
                     />
                  );
               })}
               {(definition as IRomeHistoryDefinitions).requireProvince?.map((province) => {
                  return (
                     <TechPrerequisiteItemComponent
                        key={province}
                        name={
                           <>
                              {t(L.Annex)} <b>{Unlockable.RomeProvince.definitions[province].name()}</b>
                           </>
                        }
                        unlocked={!!gs.unlocked[province]}
                        action={() => Singleton().sceneManager.loadScene(RomeProvinceScene)?.selectProvince(province)}
                     />
                  );
               })}
               {definition.require.length === 0 ? <div>{t(L.TechnologyNoPrerequisite)}</div> : null}
            </fieldset>
            <fieldset>
               <legend>{t(L.Progress)}</legend>
               {gs.unlocked[tech] ? (
                  <div className="row text-green">
                     <div className="m-icon small mr5">check_circle</div>
                     <div>{t(L.TechHasBeenUnlocked, { tech: definition.name() })}</div>
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
                              gs.unlocked[tech] = true;
                              notifyGameStateUpdate();
                              onUnlockableUnlocked(tech, type, gs);
                           }}
                        >
                           {t(L.UnlockBuilding)}
                        </button>
                     </div>
                  </>
               )}
            </fieldset>
            <UnlockableEffectComponent definition={definition} gameState={gs} />
         </div>
      </div>
   );
}
