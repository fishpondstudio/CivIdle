import { getTranslatedPercentage } from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import {
   PRIORITY_MAX,
   PRIORITY_MIN,
   getConstructionPriority,
   getProductionPriority,
   getUpgradePriority,
   setConstructionPriority,
   setProductionPriority,
   setUpgradePriority,
} from "../../../shared/logic/Tile";
import { formatPercent } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { openUrl } from "../utilities/Platform";
import { ChangeSoundComponent } from "./ChangeSoundComponent";
import { LanguageSelect } from "./LanguageSelectComponent";
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
               <legend>{t(L.Language)}</legend>
               <LanguageSelect className="w100" />
               {options.language !== "en" ? (
                  <div
                     className="mt5 text-link"
                     onClick={() =>
                        openUrl("https://github.com/fishpondstudio/CivIdle/tree/main/shared/languages")
                     }
                  >
                     {t(L.TranslationPercentage, {
                        language: L.CurrentLanguage,
                        percentage: formatPercent(getTranslatedPercentage()),
                     })}
                  </div>
               ) : null}
            </fieldset>
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
               <ChangeSoundComponent />
            </fieldset>
         </div>
      </div>
   );
}
