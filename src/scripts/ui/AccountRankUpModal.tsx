import type { AccountLevel, IUser } from "../../../shared/utilities/Database";
import { $t, L } from "../../../shared/utilities/i18n";
import RomanMagistrate from "../../images/RomanMagistrate.jpg";
import { saveGame } from "../Global";
import { AccountLevelNames } from "../logic/AccountLevel";
import { client } from "../rpc/RPCClient";
import { Fonts } from "../visuals/Fonts";
import { playClick, playError } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";
import { AccountLevelComponent } from "./TextureSprites";

export function AccountRankUpModal({ rank, user }: { rank: AccountLevel; user: IUser }): React.ReactNode {
   return (
      <div className="window modal-window" style={{ width: "50rem" }}>
         <div className="title-bar">
            <div className="title-bar-text">{$t(L.AccountRankUp)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <img src={RomanMagistrate} className="modal-hero" />
            <div className="sep10"></div>
            <div className="row" style={{ fontFamily: Fonts.OldTypefaces, fontSize: "3.2rem" }}>
               <div className="f1"></div>
               <AccountLevelComponent level={user.level} scale={0.32} style={{ marginRight: "0.5rem" }} />
               <div>{AccountLevelNames[user.level]()}</div>
               <div style={{ width: "6rem", flexShrink: 0 }} className="m-icon text-center text-desc">
                  keyboard_double_arrow_right
               </div>
               <AccountLevelComponent level={rank} scale={0.32} style={{ marginRight: "0.5rem" }} />
               <div>{AccountLevelNames[rank]()}</div>
               <div className="f1"></div>
            </div>
            <div className="sep20"></div>
            <div className="text-desc text-center">{$t(L.AccountRankUpDesc)}</div>
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
               <div className="f1">{$t(L.AccountRankUp)}</div>
            </button>
         </div>
      </div>
   );
}
