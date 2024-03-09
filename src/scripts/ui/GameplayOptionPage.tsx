import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { getTranslatedPercentage } from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import {
   PRIORITY_MAX,
   PRIORITY_MIN,
   STOCKPILE_CAPACITY_MAX,
   STOCKPILE_CAPACITY_MIN,
   STOCKPILE_MAX_MAX,
   STOCKPILE_MAX_MIN,
} from "../../../shared/logic/Tile";
import { formatPercent, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { openUrl } from "../utilities/Platform";
import { playClick } from "../visuals/Sound";
import { ChangeSoundComponent } from "./ChangeSoundComponent";
import { LanguageSelect } from "./LanguageSelectComponent";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";

export function GameplayOptionPage(): React.ReactNode {
   const options = useGameOptions();
   const gs = useGameState();
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
            {hasFeature(GameFeature.BuildingProductionPriority, gs) ? (
               <fieldset>
                  <div className="row">
                     <div className="f1">{t(L.DefaultProductionPriority)}</div>
                     <div className="text-strong">{options.defaultProductionPriority}</div>
                  </div>
                  <div className="sep5" />
                  <input
                     type="range"
                     min={PRIORITY_MIN}
                     max={PRIORITY_MAX}
                     step="1"
                     value={options.defaultProductionPriority}
                     onChange={(e) => {
                        options.defaultProductionPriority = safeParseInt(e.target.value, PRIORITY_MIN);
                        notifyGameOptionsUpdate(options);
                     }}
                  />
                  <div className="sep10" />
                  <div className="separator" />
                  <legend>{t(L.BuildingPriority)}</legend>
                  <div className="row">
                     <div className="f1">{t(L.DefaultConstructionPriority)}</div>
                     <div className="text-strong">{options.defaultConstructionPriority}</div>
                  </div>
                  <div className="sep5" />
                  <input
                     type="range"
                     min={PRIORITY_MIN}
                     max={PRIORITY_MAX}
                     step="1"
                     value={options.defaultConstructionPriority}
                     onChange={(e) => {
                        options.defaultConstructionPriority = safeParseInt(e.target.value, PRIORITY_MIN);
                        notifyGameOptionsUpdate(options);
                     }}
                  />
                  <div className="sep10" />
               </fieldset>
            ) : null}
            {hasFeature(GameFeature.BuildingStockpileMode, gs) ? (
               <fieldset>
                  <legend>{t(L.StockpileSettingsHeading)}</legend>
                  <div className="row">
                     <div className="f1">{t(L.DefaultStockpileSettings)}</div>
                     <div className="text-strong">{options.defaultStockpileCapacity}x</div>
                  </div>
                  <div className="sep5" />
                  <input
                     type="range"
                     min={STOCKPILE_CAPACITY_MIN}
                     max={STOCKPILE_CAPACITY_MAX}
                     value={options.defaultStockpileCapacity}
                     onChange={(e) => {
                        options.defaultStockpileCapacity = parseInt(e.target.value, 10);
                        notifyGameOptionsUpdate(options);
                     }}
                  />
                  <div className="sep10" />
                  <div className="separator" />
                  <div className="row">
                     <div className="f1">{t(L.DefaultStockpileMax)}</div>
                     <div className="text-strong">
                        {options.defaultStockpileMax <= 0
                           ? t(L.StockpileMaxUnlimited)
                           : `${options.defaultStockpileMax}x`}
                     </div>
                  </div>
                  <div className="sep5"></div>
                  <input
                     type="range"
                     min={STOCKPILE_MAX_MIN}
                     max={STOCKPILE_MAX_MAX}
                     step="5"
                     value={options.defaultStockpileMax}
                     onChange={(e) => {
                        options.defaultStockpileMax = parseInt(e.target.value, 10);
                        notifyGameOptionsUpdate(options);
                     }}
                  />
                  <div className="sep10" />
               </fieldset>
            ) : null}
            <fieldset>
               <legend>{t(L.Sound)}</legend>
               <ChangeSoundComponent />
            </fieldset>
            <fieldset>
               <legend>{t(L.Chat)}</legend>
               <div className="row">
                  <div className="f1">
                     <div>{t(L.ChatHideLatestMessage)}</div>
                     <div className="text-desc">{t(L.ChatHideLatestMessageDesc)}</div>
                  </div>
                  <div
                     onClick={() => {
                        playClick();
                        options.chatHideLatestMessage = !options.chatHideLatestMessage;
                        notifyGameOptionsUpdate(options);
                     }}
                     className="ml10 pointer"
                  >
                     {options.chatHideLatestMessage ? (
                        <div className="m-icon text-green">toggle_on</div>
                     ) : (
                        <div className="m-icon text-grey">toggle_off</div>
                     )}
                  </div>
               </div>
            </fieldset>
            <fieldset>
               <legend>{t(L.Server)}</legend>
               <div className="row">
                  <div className="f1">
                     <div>{t(L.UseMirrorServer)}</div>
                     <RenderHTML className="text-desc" html={t(L.UseMirrorServerDescHTML)} />
                  </div>
                  <div
                     onClick={() => {
                        playClick();
                        options.useMirrorServer = !options.useMirrorServer;
                        notifyGameOptionsUpdate(options);
                     }}
                     className="ml10 pointer"
                  >
                     {options.useMirrorServer ? (
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
