import { notifyGameOptionsUpdate, useGameOptions } from "../Global";
import {
   PRIORITY_MAX,
   PRIORITY_MIN,
   getConstructionPriority,
   getProductionPriority,
   getUpgradePriority,
   setConstructionPriority,
   setProductionPriority,
   setUpgradePriority,
} from "../logic/Tile";
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
               <div className="row">
                  <div className="f1">{t(L.DefaultProductionPriority)}</div>
                  <div className="text-strong">{getProductionPriority(options.defaultPriority)}</div>
               </div>
               <div className="sep5" />
               <input
                  type="range"
                  min={PRIORITY_MIN}
                  max={PRIORITY_MAX}
                  step="1"
                  value={getProductionPriority(options.defaultPriority)}
                  onChange={(e) => {
                     options.defaultPriority = setProductionPriority(
                        options.defaultPriority,
                        parseInt(e.target.value, 10),
                     );
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <div className="sep10" />
               <div className="separator" />
               <legend>{t(L.BuildingPriority)}</legend>
               <div className="row">
                  <div className="f1">{t(L.DefaultConstructionPriority)}</div>
                  <div className="text-strong">{getConstructionPriority(options.defaultPriority)}</div>
               </div>
               <div className="sep5" />
               <input
                  type="range"
                  min={PRIORITY_MIN}
                  max={PRIORITY_MAX}
                  step="1"
                  value={getConstructionPriority(options.defaultPriority)}
                  onChange={(e) => {
                     options.defaultPriority = setConstructionPriority(
                        options.defaultPriority,
                        parseInt(e.target.value, 10),
                     );
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <div className="sep10" />
               <div className="separator" />
               <div className="row">
                  <div className="f1">{t(L.DefaultUpgradePriority)}</div>
                  <div className="text-strong">{getUpgradePriority(options.defaultPriority)}</div>
               </div>
               <div className="sep5" />
               <input
                  type="range"
                  min={PRIORITY_MIN}
                  max={PRIORITY_MAX}
                  step="1"
                  value={getUpgradePriority(options.defaultPriority)}
                  onChange={(e) => {
                     options.defaultPriority = setUpgradePriority(
                        options.defaultPriority,
                        parseInt(e.target.value, 10),
                     );
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <div className="sep10" />
            </fieldset>
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
         </div>
      </div>
   );
}
