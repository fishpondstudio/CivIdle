import classNames from "classnames";
import { notifyGameOptionsUpdate, syncUITheme, useGameOptions } from "../Global";
import { ThemeColorNames } from "../logic/GameState";
import { Tick } from "../logic/TickLogic";
import { keysOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
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
                                 if (isFinite(parsed) && parsed >= 0 && parsed <= 1) {
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
               {keysOf(gameOptions.buildingColors)
                  .sort((a, b) =>
                     Tick.current.buildings[a].name().localeCompare(Tick.current.buildings[b].name()),
                  )
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

            <fieldset>
               <legend>{t(L.ResourceColor)}</legend>
               {keysOf(gameOptions.resourceColors)
                  .sort((a, b) =>
                     Tick.current.resources[a].name().localeCompare(Tick.current.resources[b].name()),
                  )
                  .map((b) => {
                     return (
                        <div key={b} className="row mv5">
                           <div className="f1">{Tick.current.resources[b].name()}</div>
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
            </fieldset>
         </div>
      </div>
   );
}
