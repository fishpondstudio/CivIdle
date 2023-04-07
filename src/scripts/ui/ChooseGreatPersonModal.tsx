import { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { Singleton } from "../Global";
import { Config } from "../logic/Constants";
import { L, t } from "../utilities/i18n";
import { greatPersonImage } from "../visuals/GreatPersonVisual";

export function ChooseGreatPersonModal() {
   return (
      <div className="window" style={{ width: "650px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.AGreatPersonIsBorn)}</div>
         </div>
         <div className="window-body">
            <div className="row" style={{ alignItems: "stretch" }}>
               <div className="inset-shallow white p10 f1 text-center pointer">
                  <GreatPersonCard greatPerson="Cincinnatus" />
               </div>
               <div style={{ width: "5px" }} />
               <div className="inset-shallow white p10 f1 text-center pointer">
                  <GreatPersonCard greatPerson="ScipioAfricanus" />
               </div>
               <div style={{ width: "5px" }} />
               <div className="inset-shallow white p10 f1 text-center pointer">
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
