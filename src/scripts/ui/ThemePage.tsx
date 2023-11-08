import classNames from "classnames";
import { notifyGameOptionsUpdate, syncUITheme, useGameOptions } from "../Global";
import { ThemeColorNames } from "../logic/GameState";
import { Tick } from "../logic/TickLogic";
import { jsxMapOf, keysOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { MenuComponent } from "./MenuComponent";

export function ThemePage(): JSX.Element {
   const gameOptions = useGameOptions();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Theme)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <legend>{t(L.ThemeColor)}</legend>
               <div className="row">
                  <div className="f1">{t(L.OptionsUseModernUI)}</div>
                  <div
                     onClick={() => {
                        gameOptions.useModernUI = !gameOptions.useModernUI;
                        notifyGameOptionsUpdate(gameOptions);
                        syncUITheme(gameOptions);
                     }}
                     className={classNames({
                        "m-icon": true,
                        "text-green": gameOptions.useModernUI,
                        "text-desc": !gameOptions.useModernUI,
                     })}
                     style={{ margin: "-5px 0" }}
                  >
                     {gameOptions.useModernUI ? "toggle_on" : "toggle_off"}
                  </div>
               </div>
            </fieldset>

            <fieldset>
               {jsxMapOf(gameOptions.themeColors, (k, v) => {
                  return (
                     <div key={k} className="row mv5">
                        <div className="f1">{ThemeColorNames[k]()}</div>
                        <input
                           type="color"
                           value={gameOptions.themeColors[k]}
                           onChange={(v) => {
                              gameOptions.themeColors[k] = v.target.value;
                              notifyGameOptionsUpdate();
                           }}
                        />
                     </div>
                  );
               })}
            </fieldset>

            <fieldset>
               <legend>{t(L.BuildingColor)}</legend>
               {keysOf(gameOptions.buildingColors)
                  .sort((a, b) => Tick.current.buildings[a].name().localeCompare(Tick.current.buildings[b].name()))
                  .map((b) => {
                     return (
                        <div key={b} className="row mv5">
                           <div className="f1">{Tick.current.buildings[b].name()}</div>
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
            </fieldset>
         </div>
      </div>
   );
}
