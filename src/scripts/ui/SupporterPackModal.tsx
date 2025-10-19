import Tippy from "@tippyjs/react";
import { GameAnalytics } from "gameanalytics";
import { useEffect } from "react";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
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
      <div className="window" style={{ width: "500px", maxWidth: "50vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.SupporterPack)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <Tippy content="Cicerone denuncia Catilina, Cesare Maccari, 1882 ~ 1888">
            <img src={SupporterPackImage} className="w100" style={{ display: "block" }} />
         </Tippy>
         <div className="window-body" style={{ overflowY: "auto", maxHeight: "75vh" }}>
            <div className="inset-shallow white row g10 p10">
               <div>
                  <MiscTextureComponent name="Supporter" scale={0.5} />
               </div>
               <div style={{ fontSize: "1.6rem" }}>{t(L.ThankYouForSupporting)}</div>
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
                  {t(L.EmpireMustGrow)}
               </button>
            </div>
         </div>
      </div>
   );
}
