import Tippy from "@tippyjs/react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { isNaturalWonder } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getGameOptions, notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { L, t } from "../../../shared/utilities/i18n";
import NaturalWonders from "../../images/NaturalWonders.jpg";
import WorldWonders from "../../images/WorldWonders.jpg";
import { Fonts } from "../visuals/Fonts";
import { playClick } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { html } from "./RenderHTMLComponent";
import { BuildingSpriteComponent } from "./TextureSprites";

export function BuildingCompleteModal({ building }: { building: Building }): React.ReactNode {
   const def = Config.Building[building];
   const isNatural = isNaturalWonder(building);
   const options = getGameOptions();
   return (
      <div className="window" style={{ width: "500px", maxWidth: "50vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{def.name()}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <Tippy
            content={
               isNatural
                  ? "The Grand Canyon of the Yellowstone, Thomas Moran, 1872"
                  : "Octo Mundi Miracula, Maarten van Heemskerck & Philip Galle, 1572"
            }
         >
            <img
               src={isNatural ? NaturalWonders : WorldWonders}
               className="w100"
               style={{ display: "block" }}
            />
         </Tippy>
         <div className="window-body" style={{ overflowY: "auto", maxHeight: "75vh" }}>
            <div className="inset-shallow white row g10 p10">
               <div>
                  <BuildingSpriteComponent building={building} style={{ filter: "invert(0.75)" }} />
               </div>
               <div>
                  <div className="f1" style={{ fontFamily: Fonts.OldTypefaces, fontSize: 24 }}>
                     {def.name()}
                  </div>
                  <div>{def.desc?.()}</div>
               </div>
            </div>
            <div className="sep10" />
            <div className="row">
               <div
                  className="text-desc pointer"
                  onClick={() => {
                     playClick();
                     if (isNatural) {
                        options.showNaturalWonderPopup = false;
                     } else {
                        options.showWonderPopup = false;
                     }
                     notifyGameOptionsUpdate(options);
                     hideModal();
                  }}
               >
                  {t(L.DontShowThisAgain)}
               </div>
               <div className="f1" />
               <button
                  onClick={() => {
                     playClick();
                     hideModal();
                  }}
               >
                  {isNatural ? html(t(L.NaturallyHTML)) : html(t(L.WonderFullHTML))}
               </button>
            </div>
         </div>
      </div>
   );
}
