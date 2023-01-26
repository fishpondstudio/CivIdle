import { getMultipliersFor, totalMultiplierFor } from "../logic/BuildingLogic";
import { GameState } from "../logic/GameState";
import { Multiplier } from "../logic/TickLogic";
import { L, t } from "../utilities/i18n";

export function MultiplierTreeViewComponent({
   gameState,
   xy,
   type,
}: {
   gameState: GameState;
   xy: string;
   type: keyof Pick<Multiplier, "input" | "output">;
}) {
   const totalMultiplier = totalMultiplierFor(xy, type, gameState);
   if (totalMultiplier <= 1) {
      return null;
   }
   return (
      <ul className="tree-view">
         <details>
            <summary className="row">
               <div className="f1">{type === "input" ? t(L.ConsumptionMultiplier) : t(L.ProductionMultiplier)}</div>
               <div>
                  <strong>x{totalMultiplier}</strong>
               </div>
            </summary>
            <ul>
               <li className="row">
                  <div className="f1">{t(L.BaseMultiplier)}</div>
                  <div>1</div>
               </li>
               {getMultipliersFor(xy, gameState).map((m, idx) => {
                  if (!m[type]) {
                     return null;
                  }
                  return (
                     <li key={idx} className="row">
                        <div className="f1">{m.source}</div>
                        <div>{m[type]}</div>
                     </li>
                  );
               })}
            </ul>
         </details>
      </ul>
   );
}
