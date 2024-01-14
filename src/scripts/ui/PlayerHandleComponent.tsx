import classNames from "classnames";
import { useState } from "react";
import { useGameOptions, useGameState } from "../Global";
import { useUser } from "../rpc/RPCClient";
import { getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { L, t } from "../utilities/i18n";
import { playError } from "../visuals/Sound";
import { ChangePlayerHandleModal } from "./ChangePlayerHandleModal";
import { showModal } from "./GlobalModal";

export function PlayerHandleComponent() {
   const user = useUser();
   const opt = useGameOptions();
   const gs = useGameState();
   const [showDetails, setShowDetails] = useState(false);
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
         {showDetails ? (
            <>
               <div className="separator"></div>
               <div className="row text-strong">
                  <div className="f1">{t(L.AccountType)}</div>
                  {opt.isOffline ? null : <div className="m-icon small mr5 text-green">wifi</div>}
                  <div>{opt.isOffline ? t(L.AccountTypeOffline) : t(L.AccountTypeOnline)}</div>
               </div>
               <div className="text-desc text-small text-justify">{t(L.AccountTypeDesc)}</div>
               <div className="sep10" />
               <div className="row text-strong">
                  <div className="f1">{t(L.ThisRunType)}</div>
                  {gs.isOffline ? null : <div className="m-icon small mr5 text-green">wifi</div>}
                  <div>{gs.isOffline ? t(L.AccountTypeOffline) : t(L.AccountTypeOnline)}</div>
               </div>
               <div className="text-desc text-small text-justify">{t(L.ThisRunTypeDesc)}</div>
            </>
         ) : (
            <div className="text-small text-link" onClick={() => setShowDetails(true)}>
               {t(L.AccountTypeShowDetails)}
            </div>
         )}
      </fieldset>
   );
}
