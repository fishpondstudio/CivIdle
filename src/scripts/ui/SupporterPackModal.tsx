import { LazyTippy } from "./LazyTippy";
import { GameAnalytics } from "gameanalytics";
import { useEffect } from "react";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import { $t, L } from "../../../shared/utilities/i18n";
import SupporterPackImage from "../../images/SupporterPackImage.jpg";
import { isSteam } from "../rpc/SteamClient";
import { isAndroid, isIOS } from "../utilities/Platforms";
import { playClick } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { MiscTextureComponent } from "./TextureSprites";

export function SupporterPackModal(): React.ReactNode {
   useEffect(() => {
      getGameOptions().supporterPackPurchased = true;
      let platform = "Unknown";
      if (isSteam()) {
         platform = "Steam";
      } else if (isIOS()) {
         platform = "iOS";
      } else if (isAndroid()) {
         platform = "Android";
      }
      if (!import.meta.env.DEV) {
         GameAnalytics.addBusinessEvent("USD", 499, "DLC", "SupporterPack", platform);
      }
   }, []);
   return (
      <div className="window modal-window" style={{ width: "50rem" }}>
         <div className="title-bar">
            <div className="title-bar-text">{$t(L.SupporterPack)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <LazyTippy content="Cicerone denuncia Catilina, Cesare Maccari, 1882 ~ 1888">
               <img src={SupporterPackImage} className="modal-hero" />
            </LazyTippy>
            <div className="inset-shallow white row g10 p10">
               <div>
                  <MiscTextureComponent name="Supporter" scale={0.5} />
               </div>
               <div style={{ fontSize: "1.6rem" }}>{$t(L.ThankYouForSupporting)}</div>
            </div>
            <div className="sep10" />
            <div className="row">
               <div className="f1" />
               <button
                  onClick={() => {
                     playClick();
                     hideModal();
                  }}
               >
                  {$t(L.EmpireMustGrow)}
               </button>
            </div>
         </div>
      </div>
   );
}
