import { Languages, syncLanguage } from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { useGameOptions } from "../Global";
import { jsxMapOf } from "../utilities/Helper";

export function LanguageSelect({ className }: { className?: string }): React.ReactNode {
   const options = useGameOptions();
   return (
      <select
         className={className}
         value={options.language}
         onChange={(e) => {
            options.language = e.target.value as keyof typeof Languages;
            syncLanguage(Languages[options.language]);
            notifyGameOptionsUpdate(options);
         }}
      >
         {jsxMapOf(Languages, (k, v) => {
            return (
               <option key={k} value={k}>
                  {v.CurrentLanguage}
               </option>
            );
         })}
      </select>
   );
}
