import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { playClick } from "../visuals/Sound";

export function ChangeSoundComponent(): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className="row">
         <div className="f1">{t(L.SoundEffect)}</div>
         <div
            onClick={() => {
               options.soundEffect = !options.soundEffect;
               playClick();
               notifyGameOptionsUpdate(options);
            }}
            className="ml10 pointer"
         >
            {options.soundEffect ? (
               <div className="m-icon text-green">toggle_on</div>
            ) : (
               <div className="m-icon text-grey">toggle_off</div>
            )}
         </div>
      </div>
   );
}
