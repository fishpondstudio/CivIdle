import type { ITechDefinition } from "../../../shared/definitions/ITechDefinition";
import { getBuildingCost } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { GlobalMultiplierNames } from "../../../shared/logic/TickLogic";
import { getDepositTileCount } from "../../../shared/logic/Tile";
import { formatNumber, mapOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import { BuildingSpriteComponent } from "./TextureSprites";

export function UnlockableEffectComponent({
   definition,
   gameState,
}: {
   definition: ITechDefinition;
   gameState: GameState;
}): React.ReactNode {
   return (
      <>
         {definition.revealDeposit?.map((d) => {
            const deposit = Config.Material[d];
            return (
               <fieldset key={d}>
                  <legend>
                     <b>{t(L.RevealDeposit)}</b> {deposit.name()}
                  </legend>
                  {t(L.DepositTileCountDesc, {
                     count: getDepositTileCount(d, gameState),
                     city: Config.City[gameState.city].name(),
                     deposit: deposit.name(),
                  })}
               </fieldset>
            );
         })}
         {definition.unlockBuilding?.map((b) => {
            const building = Config.Building[b];
            return (
               <fieldset key={b}>
                  <legend>
                     <b>{t(L.UnlockBuilding)}</b> {building.name()}
                  </legend>
                  <div className="row">
                     <BuildingSpriteComponent
                        building={b}
                        scale={0.5}
                        style={{ filter: "invert(0.75)", margin: "0 10px 0 0" }}
                     />
                     <div className="f1">
                        {jsxMapOf(building.input, (res, v) => {
                           return (
                              <div className="row mv5" key={res}>
                                 <div className="f1">
                                    {t(L.ConsumeResource, { resource: Config.Material[res].name() })}
                                 </div>
                                 <div>
                                    <strong>{v}</strong>
                                 </div>
                              </div>
                           );
                        })}
                        {jsxMapOf(building.output, (res, v) => {
                           return (
                              <div className="row mv5" key={res}>
                                 <div className="f1">
                                    {t(L.ProduceResource, { resource: Config.Material[res].name() })}
                                 </div>
                                 <div>
                                    <strong>{v}</strong>
                                 </div>
                              </div>
                           );
                        })}
                        {building.power ? (
                           <div className="row mv5 text-orange text-strong">
                              <div className="m-icon small">bolt</div>
                              <div className="f1">{t(L.RequirePower)}</div>
                           </div>
                        ) : null}
                        {building.desc ? <div className="row mv5">{building.desc()}</div> : null}
                        <div className="text-desc">
                           {t(L.ConstructionCost, {
                              cost: mapOf(
                                 getBuildingCost({ type: b, level: 0 }),
                                 (res, amount) => `${Config.Material[res].name()} x${formatNumber(amount)}`,
                              ).join(", "),
                           })}
                        </div>
                     </div>
                  </div>
               </fieldset>
            );
         })}
         {jsxMapOf(definition.buildingMultiplier, (k, v) => {
            return (
               <fieldset key={k}>
                  <legend>
                     <b>{t(L.BuildingMultipliers)}</b> {Config.Building[k].name()}
                  </legend>
                  {v.output ? (
                     <div className="row mv5">
                        <div className="f1">{t(L.ProductionMultiplier)}</div>
                        <div className="text-strong">+{v.output}</div>
                     </div>
                  ) : null}
                  {v.worker ? (
                     <div className="row mv5">
                        <div className="f1">{t(L.WorkerMultiplier)}</div>
                        <div className="text-strong">+{v.worker}</div>
                     </div>
                  ) : null}
                  {v.storage ? (
                     <div className="row mv5">
                        <div className="f1">{t(L.StorageMultiplier)}</div>
                        <div className="text-strong">+{v.storage}</div>
                     </div>
                  ) : null}
               </fieldset>
            );
         })}
         {definition.globalMultiplier ? (
            <fieldset>
               <legend>
                  <b>{t(L.TechGlobalMultiplier)}</b>
               </legend>
               {jsxMapOf(definition.globalMultiplier, (k, v) => {
                  return (
                     <div key={k} className="row mv5">
                        <div className="f1">{GlobalMultiplierNames[k]()}</div>
                        <div className="text-strong">+{v}</div>
                     </div>
                  );
               })}
            </fieldset>
         ) : null}
         {definition.additionalUpgrades?.().map((v, idx) => {
            return (
               <fieldset key={idx}>
                  <legend>
                     <b>{t(L.UnlockBuilding)}</b>
                  </legend>
                  <div className="mv5">{v}</div>
               </fieldset>
            );
         })}
      </>
   );
}
