import { Config } from "../../../shared/logic/Config";
import { ThemeColorNames, resetThemeBuildingColors, resetThemeColor, resetThemeResourceColors } from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { keysOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { playClick } from "../visuals/Sound";
import { ChangeModernUIComponent } from "./ChangeModernUIComponent";
import { MenuComponent } from "./MenuComponent";

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
            </fieldset>
            <fieldset>
               <legend>{t(L.ThemeColor)}</legend>
               {keysOf(gameOptions.themeColors).map((k) => {
                  if (typeof gameOptions.themeColors[k] === "string") {
                     return (
                        <div key={k} className="row mv5">
                           <div className="f1">{ThemeColorNames[k]()}</div>
                           <input
                              type="color"
                              value={gameOptions.themeColors[k]}
                              onChange={(v) => {
                                 gameOptions.themeColors[k] = v.target.value as never;
                                 notifyGameOptionsUpdate();
                              }}
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
               <div
                  className="mv5 text-link pointer text-strong"
                  onClick={() => {
                     playClick();
                     resetThemeColor();
                  }}
               >
                  {t(L.ThemeColorReset)}
               </div>
            </fieldset>

            <fieldset>
               <legend>{t(L.BuildingColor)}</legend>
               {keysOf(gameOptions.buildingColors)
                  .sort((a, b) => Config.Building[a].name().localeCompare(Config.Building[b].name()))
                  .map((b) => {
                     return (
                        <div key={b} className="row mv5">
                           <div className="f1">{Config.Building[b].name()}</div>
                           <input
                              type="color"
                              value={gameOptions.buildingColors[b] ?? "#ffffff"}
                              onChange={(v) => {
                                 gameOptions.buildingColors[b] = v.target.value;
                                 notifyGameOptionsUpdate();
                              }}
                           />
                        </div>
                     );
                  })}
               <div
                  className="mv5 text-link pointer text-strong"
                  onClick={() => {
                     playClick();
                     resetThemeBuildingColors();
                  }}
               >
                  {t(L.ThemeColorResetBuildingColors)}
               </div>                  
            </fieldset>

            <fieldset>
               <legend>{t(L.ResourceColor)}</legend>
               {keysOf(gameOptions.resourceColors)
                  .sort((a, b) => Config.Resource[a].name().localeCompare(Config.Resource[b].name()))
                  .map((b) => {
                     return (
                        <div key={b} className="row mv5">
                           <div className="f1">{Config.Resource[b].name()}</div>
                           <input
                              type="color"
                              value={gameOptions.resourceColors[b] ?? "#ffffff"}
                              onChange={(v) => {
                                 gameOptions.resourceColors[b] = v.target.value;
                                 notifyGameOptionsUpdate();
                              }}
                           />
                        </div>
                     );
                  })}
               <div
                  className="mv5 text-link pointer text-strong"
                  onClick={() => {
                     playClick();
                     resetThemeResourceColors();
                  }}
               >
                  {t(L.ThemeColorResetResourceColors)}
               </div>                    
            </fieldset>
         </div>
      </div>
   );
}
