import { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { notifyGameStateUpdate, Singleton, useGameState } from "../Global";
import { Config } from "../logic/Constants";
import { safeAdd } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { greatPersonImage } from "../visuals/GreatPersonVisual";
import { hideModal } from "./GlobalModal";

export function ChooseGreatPersonModal() {
   const gs = useGameState();
   return (
      <div className="window" style={{ width: "650px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.AGreatPersonIsBorn)}</div>
         </div>
         <div className="window-body">
            <div className="row" style={{ alignItems: "stretch" }}>
               <div
                  className="inset-shallow white p10 f1 text-center pointer"
                  onClick={() => {
                     safeAdd(gs.greatPeople, "Cincinnatus", 1);
                     notifyGameStateUpdate();
                     hideModal();
                  }}
               >
                  <GreatPersonCard greatPerson="Cincinnatus" />
               </div>
               <div style={{ width: "5px" }} />
               <div
                  className="inset-shallow white p10 f1 text-center pointer"
                  onClick={() => {
                     safeAdd(gs.greatPeople, "ScipioAfricanus", 1);
                     notifyGameStateUpdate();
                     hideModal();
                  }}
               >
                  <GreatPersonCard greatPerson="ScipioAfricanus" />
               </div>
               <div style={{ width: "5px" }} />
               <div
                  className="inset-shallow white p10 f1 text-center pointer"
                  onClick={() => {
                     safeAdd(gs.greatPeople, "JuliusCaesar", 1);
                     notifyGameStateUpdate();
                     hideModal();
                  }}
               >
                  <GreatPersonCard greatPerson="JuliusCaesar" />
               </div>
            </div>
         </div>
      </div>
   );
}

function GreatPersonCard({ greatPerson }: { greatPerson: GreatPerson }) {
   const { desc } = Config.GreatPerson[greatPerson];
   return (
      <>
         <img src={greatPersonImage(greatPerson, Singleton().sceneManager.getContext())} style={{ width: "100%" }} />
         <div className="sep5" />
         {t(desc(), { value: 1 })}
      </>
   );
}
