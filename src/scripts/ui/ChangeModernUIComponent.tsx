import classNames from "classnames";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { $t, L } from "../../../shared/utilities/i18n";
import { syncUITheme, useGameOptions } from "../Global";
import { Singleton } from "../utilities/Singleton";
import { playClick } from "../visuals/Sound";

export function ChangeModernUIComponent(): React.ReactNode {
   const gameOptions = useGameOptions();
   return (
      <div className="row">
         <div className="f1">{$t(L.OptionsUseModernUIV2)}</div>
         <div
            onClick={() => {
               playClick();
               gameOptions.useModernUI = !gameOptions.useModernUI;
               syncUITheme(Singleton().sceneManager.getContext().app, gameOptions);
               notifyGameOptionsUpdate(gameOptions);
            }}
            className={classNames({
               "m-icon pointer": true,
               "text-green": gameOptions.useModernUI,
               "text-desc": !gameOptions.useModernUI,
            })}
            style={{ margin: "-0.5rem 0" }}
         >
            {gameOptions.useModernUI ? "toggle_on" : "toggle_off"}
         </div>
      </div>
   );
}
