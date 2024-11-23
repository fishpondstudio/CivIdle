import type { AccountLevel, IUser } from "../../../shared/utilities/Database";
import { L, t } from "../../../shared/utilities/i18n";
import RomanMagistrate from "../../images/RomanMagistrate.jpg";
import { saveGame } from "../Global";
import { AccountLevelImages, AccountLevelNames } from "../logic/AccountLevel";
import { client } from "../rpc/RPCClient";
import { Fonts } from "../visuals/Fonts";
import { playClick, playError } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";

export function AccountRankUpModal({ rank, user }: { rank: AccountLevel; user: IUser }): React.ReactNode {
   return (
      <div className="window" style={{ width: 500, maxWidth: "50vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.AccountRankUp)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <img src={RomanMagistrate} className="w100" />
         <div className="window-body">
            <div className="sep10"></div>
            <div className="row" style={{ fontFamily: Fonts.OldTypefaces, fontSize: 32 }}>
               <div className="f1"></div>
               <img src={AccountLevelImages[user.level]} style={{ width: 32, marginRight: 5 }} />
               <div>{AccountLevelNames[user.level]()}</div>
               <div style={{ width: 60 }} className="m-icon text-center text-desc">
                  keyboard_double_arrow_right
               </div>
               <img src={AccountLevelImages[rank]} style={{ width: 32, marginRight: 5 }} />
               <div>{AccountLevelNames[rank]()}</div>
               <div className="f1"></div>
            </div>
            <div className="sep20"></div>
            <div className="text-desc text-center">{t(L.AccountRankUpDesc)}</div>
            <div className="sep10"></div>
            <button
               className="w100 row text-strong"
               onClick={async () => {
                  try {
                     playClick();
                     await client.rankUp();
                     await saveGame();
                     window.location.reload();
                  } catch (error) {
                     playError();
                     showToast(String(error));
                  }
               }}
            >
               <div className="m-icon">upgrade</div>
               <div className="f1">{t(L.AccountRankUp)}</div>
            </button>
         </div>
      </div>
   );
}
