import { PropsWithChildren } from "react";
import { notifyGameStateUpdate, useGameState } from "../Global";
import { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { Config } from "../logic/Constants";
import { safeAdd } from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
import { greatPersonImage } from "../visuals/GreatPersonVisual";
import { hideModal } from "./GlobalModal";

export function GreatPersonCard({
   greatPerson,
   onChosen,
   children,
}: PropsWithChildren<{ greatPerson: GreatPerson; onChosen: () => void }>): React.ReactNode {
   const p = Config.GreatPerson[greatPerson];
   const gs = useGameState();
   return (
      <div
         className="inset-shallow white p10 f1 text-center pointer"
         onClick={() => {
            safeAdd(gs.greatPeople, greatPerson, 1);
            onChosen();
            notifyGameStateUpdate();
            hideModal();
         }}
      >
         <img
            src={greatPersonImage(greatPerson, Singleton().sceneManager.getContext())}
            style={{ width: "100%" }}
         />
         <div className="sep5" />
         {p.desc(p, 1)}
         {children}
      </div>
   );
}
