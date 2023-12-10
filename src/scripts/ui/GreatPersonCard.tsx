import { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { Config } from "../logic/Constants";
import { Singleton } from "../utilities/Singleton";
import { greatPersonImage } from "../visuals/GreatPersonVisual";

export function GreatPersonCard({
   greatPerson,
   onChosen,
}: { greatPerson: GreatPerson; onChosen: (chosen: GreatPerson) => void }): React.ReactNode {
   const p = Config.GreatPerson[greatPerson];
   return (
      <div
         className="inset-shallow white p10 f1 text-center pointer"
         onClick={() => {
            onChosen(greatPerson);
         }}
      >
         <img
            src={greatPersonImage(greatPerson, Singleton().sceneManager.getContext())}
            style={{ width: "100%" }}
         />
         <div className="sep5" />
         {p.desc(p, 1)}
      </div>
   );
}
