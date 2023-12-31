import { notifyGameOptionsUpdate, useGameOptions } from "../Global";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { MenuComponent } from "./MenuComponent";

export function GameplayOptionPage(): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Gameplay)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <legend>{t(L.Sound)}</legend>
               <div className="row">
                  <div className="f1">
                     <div>{t(L.SoundEffect)}</div>
                     <div className="text-desc text-small">{t(L.SoundEffectDesc)}</div>
                  </div>
                  <div
                     onClick={() => {
                        playClick();
                        options.soundEffect = !options.soundEffect;
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
            </fieldset>
            <fieldset>
               <legend>{t(L.Gameplay)}</legend>
               <div className="row">
                  <div className="f1">
                     <div>{t(L.RemoveResidualConstructionResources)}</div>
                     <div className="text-desc text-small">
                        {t(L.RemoveResidualConstructionResourcesDesc)}
                     </div>
                  </div>
                  <div
                     onClick={() => {
                        playClick();
                        options.removeResidualConstructionResource =
                           !options.removeResidualConstructionResource;
                        notifyGameOptionsUpdate(options);
                     }}
                     className="ml10 pointer"
                  >
                     {options.removeResidualConstructionResource ? (
                        <div className="m-icon text-green">toggle_on</div>
                     ) : (
                        <div className="m-icon text-grey">toggle_off</div>
                     )}
                  </div>
               </div>
            </fieldset>
         </div>
      </div>
   );
}
