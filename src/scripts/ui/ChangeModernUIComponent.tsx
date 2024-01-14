import classNames from "classnames";
import { notifyGameOptionsUpdate, syncUITheme, useGameOptions } from "../Global";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";

export function ChangeModernUIComponent(): React.ReactNode {
   const gameOptions = useGameOptions();
   return (
      <div className="row">
         <div className="f1">{t(L.OptionsUseModernUI)}</div>
         <div
            onClick={() => {
               playClick();
               gameOptions.useModernUI = !gameOptions.useModernUI;
               notifyGameOptionsUpdate(gameOptions);
               syncUITheme(gameOptions);
            }}
            className={classNames({
               "m-icon pointer": true,
               "text-green": gameOptions.useModernUI,
               "text-desc": !gameOptions.useModernUI,
            })}
            style={{ margin: "-5px 0" }}
         >
            {gameOptions.useModernUI ? "toggle_on" : "toggle_off"}
         </div>
      </div>
   );
}
