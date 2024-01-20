import { formatNumber, mapOf } from "../../../shared/utilities/Helper";
import type { IUnlockableDefinition } from "../definitions/ITechDefinition";
import { getBuildingCost } from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import type { GameState } from "../logic/GameState";
import { GlobalMultiplierNames } from "../logic/TickLogic";
import { getDepositTileCount } from "../logic/Tile";
import { jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";

export function UnlockableEffectComponent({
   definition,
   gameState,
}: {
   definition: IUnlockableDefinition;
   gameState: GameState;
}): React.ReactNode {
   return (
      <>
         {definition.revealDeposit?.map((d) => {
            const deposit = Config.Resource[d];
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
                  {jsxMapOf(building.input, (res, v) => {
                     return (
                        <div className="row mv5" key={res}>
                           <div className="f1">
                              {t(L.ConsumeResource, { resource: Config.Resource[res].name() })}
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
                              {t(L.ProduceResource, { resource: Config.Resource[res].name() })}
                           </div>
                           <div>
                              <strong>{v}</strong>
                           </div>
                        </div>
                     );
                  })}
                  {building.desc ? <div className="row mv5">{building.desc()}</div> : null}
                  <div className="text-desc">
                     {t(L.ConstructionCost, {
                        cost: mapOf(
                           getBuildingCost({ type: b, level: 0 }),
                           (res, amount) => `${Config.Resource[res].name()} x${formatNumber(amount)}`,
                        ).join(", "),
                     })}
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
                  {v.input ? (
                     <div className="row mv5">
                        <div className="f1">{t(L.ConsumptionMultiplier)}</div>
                        <div className="text-strong">+{v.input}</div>
                     </div>
                  ) : null}
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
         {definition.additionalUpgrades?.map((v, idx) => {
            return (
               <fieldset key={idx}>
                  <legend>
                     <b>{t(L.UnlockBuilding)}</b>
                  </legend>
                  <div className="mv5">{v()}</div>
               </fieldset>
            );
         })}
      </>
   );
}
