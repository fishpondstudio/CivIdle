import Tippy from "@tippyjs/react";
import { Config } from "../../../shared/logic/Config";
import {
   ThemeColorNames,
   resetThemeBuildingColors,
   resetThemeColor,
   resetThemeResourceColors,
} from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { getBuildingsThatProduce } from "../../../shared/logic/ResourceLogic";
import { forEach, keysOf, safeParseFloat, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { syncFontSizeScale, useGameOptions } from "../Global";
import { playClick } from "../visuals/Sound";
import { ChangeModernUIComponent } from "./ChangeModernUIComponent";
import { ColorPicker } from "./ColorPicker";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";

export function ThemePage(): React.ReactNode {
   const gameOptions = useGameOptions();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Theme)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <ChangeModernUIComponent />
               {gameOptions.useModernUI ? (
                  <>
                     <div className="separator" />
                     <div className="row">
                        <div className="f1">
                           <div>{t(L.FontSizeScale)}</div>
                           <RenderHTML className="text-desc text-small" html={t(L.FontSizeScaleDescHTML)} />
                        </div>
                        <select
                           className="ml10"
                           value={gameOptions.fontSizeScale}
                           onChange={(e) => {
                              gameOptions.fontSizeScale = safeParseFloat(e.target.value, 1);
                              syncFontSizeScale(gameOptions);
                              notifyGameOptionsUpdate(gameOptions);
                           }}
                        >
                           <option value={0.9}>0.9x</option>
                           <option value={1}>1x</option>
                           <option value={1.1}>1.1x</option>
                           <option value={1.2}>1.2x</option>
                           <option value={1.3}>1.3x</option>
                           <option value={1.4}>1.4x</option>
                           <option value={1.5}>1.5x</option>
                        </select>
                     </div>
                  </>
               ) : null}
               <div className="separator" />
               <div className="row">
                  <div className="f1">
                     <div>{t(L.SidePanelWidth)}</div>
                     <RenderHTML className="text-desc text-small" html={t(L.SidePanelWidthDescHTML)} />
                  </div>
                  <select
                     className="ml10"
                     value={gameOptions.sidePanelWidth}
                     onChange={(e) => {
                        gameOptions.sidePanelWidth = safeParseInt(e.target.value, 400);
                        notifyGameOptionsUpdate(gameOptions);
                     }}
                  >
                     <option value={400}>400px</option>
                     <option value={450}>450px</option>
                     <option value={500}>500px</option>
                  </select>
               </div>
            </fieldset>
            <fieldset>
               <legend>{t(L.ThemeColor)}</legend>
               <div
                  className="mv5 text-link pointer text-strong"
                  onClick={() => {
                     playClick();
                     resetThemeColor();
                  }}
               >
                  {t(L.ThemeColorReset)}
               </div>
               {keysOf(gameOptions.themeColors).map((k) => {
                  if (typeof gameOptions.themeColors[k] === "string") {
                     return (
                        <div key={k} className="row mv5">
                           <div className="f1">{ThemeColorNames[k]()}</div>
                           <ColorPicker
                              value={gameOptions.themeColors[k] as string}
                              onChange={(v) => {
                                 gameOptions.themeColors[k] = v as never;
                                 notifyGameOptionsUpdate();
                              }}
                              timeout={250}
                           />
                        </div>
                     );
                  }
                  if (typeof gameOptions.themeColors[k] === "number") {
                     return (
                        <div key={k} className="row mv5">
                           <div className="f1">{ThemeColorNames[k]()}</div>
                           <input
                              type="number"
                              step="0.1"
                              max="1"
                              min="0"
                              style={{ width: "50px" }}
                              value={gameOptions.themeColors[k]}
                              onChange={(v) => {
                                 const parsed = parseFloat(v.target.value);
                                 if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
                                    gameOptions.themeColors[k] = parsed as never;
                                    notifyGameOptionsUpdate();
                                 }
                              }}
                           />
                        </div>
                     );
                  }
               })}
            </fieldset>

            <fieldset>
               <legend>{t(L.BuildingColor)}</legend>
               <div
                  className="mv5 text-link pointer text-strong"
                  onClick={() => {
                     playClick();
                     resetThemeBuildingColors();
                  }}
               >
                  {t(L.ThemeColorResetBuildingColors)}
               </div>
               {keysOf(gameOptions.buildingColors)
                  .sort((a, b) => Config.Building[a].name().localeCompare(Config.Building[b].name()))
                  .map((b) => {
                     return (
                        <div key={b} className="row mv5">
                           <div className="f1">{Config.Building[b].name()}</div>
                           <ColorPicker
                              value={gameOptions.buildingColors[b] ?? "#ffffff"}
                              onChange={(v) => {
                                 gameOptions.buildingColors[b] = v;
                                 notifyGameOptionsUpdate();
                              }}
                              timeout={250}
                           />
                        </div>
                     );
                  })}
            </fieldset>

            <fieldset>
               <legend>{t(L.ResourceColor)}</legend>
               <Tippy content={t(L.BuildingColorMatchBuildingTooltip)}>
                  <button
                     onClick={() => {
                        forEach(Config.Resource, (res) => {
                           const buildings = getBuildingsThatProduce(res);
                           for (const building of buildings) {
                              if (gameOptions.buildingColors[building]) {
                                 gameOptions.resourceColors[res] = gameOptions.buildingColors[building];
                                 return;
                              }
                           }
                        });
                        notifyGameOptionsUpdate();
                     }}
                     className="w100 text-strong"
                  >
                     {t(L.BuildingColorMatchBuilding)}
                  </button>
               </Tippy>
               <div
                  className="mv5 text-link pointer text-strong"
                  onClick={() => {
                     playClick();
                     resetThemeResourceColors();
                  }}
               >
                  {t(L.ThemeColorResetResourceColors)}
               </div>
               {keysOf(gameOptions.resourceColors)
                  .sort((a, b) => Config.Resource[a].name().localeCompare(Config.Resource[b].name()))
                  .map((b) => {
                     return (
                        <div key={b} className="row mv5">
                           <div className="f1">{Config.Resource[b].name()}</div>
                           <ColorPicker
                              value={gameOptions.resourceColors[b] ?? "#ffffff"}
                              onChange={(v) => {
                                 gameOptions.resourceColors[b] = v;
                                 notifyGameOptionsUpdate();
                              }}
                              timeout={250}
                           />
                        </div>
                     );
                  })}
            </fieldset>
         </div>
      </div>
   );
}
