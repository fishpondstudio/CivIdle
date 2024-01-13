import classNames from "classnames";
import { useUser } from "../rpc/RPCClient";
import { getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { L, t } from "../utilities/i18n";
import { playError } from "../visuals/Sound";
import { ChangePlayerHandleModal } from "./ChangePlayerHandleModal";
import { showModal } from "./GlobalModal";

export function PlayerHandleComponent() {
   const user = useUser();
   return (
      <fieldset>
         <legend>{t(L.PlayerHandle)}</legend>
         <div className="row mv5">
            <div className="text-strong">{user?.handle}</div>
            <div>
               <img
                  className="ml5 player-flag"
                  src={getFlagUrl(user?.flag)}
                  title={getCountryName(user?.flag)}
               />
            </div>
            <div className="f1" />
            <div
               className={classNames("text-link text-strong", { disabled: !user })}
               onClick={() => {
                  if (user) {
                     showModal(<ChangePlayerHandleModal />);
                  } else {
                     playError();
                  }
               }}
            >
               {t(L.ChangePlayerHandle)}
            </div>
         </div>
      </fieldset>
   );
}
