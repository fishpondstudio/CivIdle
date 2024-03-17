import classNames from "classnames";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import { syncUITheme, useGameOptions } from "../Global";
import { playClick } from "../visuals/Sound";

export function ChangeModernUIComponent(): React.ReactNode {
   const gameOptions = useGameOptions();
   return (
      <div className="row">
         <div className="f1">{t(L.OptionsUseModernUIV2)}</div>
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
