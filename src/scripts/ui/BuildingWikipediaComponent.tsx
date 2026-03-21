import Tippy from "@tippyjs/react";
import { memo, useEffect, useRef } from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { Config } from "../../../shared/logic/Config";
import { RESTITUTOR_STEAM_URL } from "../../../shared/logic/Constants";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { $t, L } from "../../../shared/utilities/i18n";
import Restitutor from "../../images/Restitutor.png";
import { useGameState } from "../Global";
import { openUrl } from "../utilities/Platform";
import type { IBuildingComponentProps } from "./BuildingPage";
import { html } from "./RenderHTMLComponent";

const WikipediaCache: Map<Building, string> = new Map();

function _BuildingWikipediaComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const type = gameState.tiles.get(xy)?.building?.type;
   if (!type) {
      return null;
   }
   const wikipedia = Config.Building[type].wikipedia;
   if (!wikipedia) {
      return null;
   }
   const iframeEl = useRef<HTMLIFrameElement>(null);
   useEffect(() => {
      if (!iframeEl.current) {
         return;
      }
      const cache = WikipediaCache.get(type);
      if (cache) {
         iframeEl.current.srcdoc = cache;
         return;
      }
      const controller = new AbortController();
      fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-html/${wikipedia}?redirect=true`, {
         signal: controller.signal,
      })
         .then(async (r) => await r.text())
         .then((t) => {
            t = t.replaceAll(`src="//`, `src="https://`);
            t = t.replaceAll(`href="//`, `href="https://`);
            WikipediaCache.set(type, t);
            if (iframeEl.current) {
               iframeEl.current.srcdoc = t;
            }
         })
         .catch(console.error);
      return () => {
         if (iframeEl.current) {
            iframeEl.current.srcdoc = "";
         }
         controller.abort();
      };
   }, [type, wikipedia]);
   return (
      <>
         <RestitutorComponent />
         <iframe
            ref={iframeEl}
            style={{ width: "100%", height: "400px", background: "#fff", marginBottom: "10px" }}
         />
      </>
   );
}

export const BuildingWikipediaComponent = memo(_BuildingWikipediaComponent, (prev, next) => {
   return prev.gameState === next.gameState && prev.xy === next.xy;
});

function RestitutorComponent(): React.ReactNode {
   const gs = useGameState();
   if (gs.unlockedUpgrades.Restitutor) {
      return null;
   }
   return (
      <Tippy content={html($t(L.RestitutorDescHTML))}>
         <div
            className="inset-shallow mb10 pointer"
            onClick={() => {
               openUrl(RESTITUTOR_STEAM_URL);
               gs.unlockedUpgrades.Restitutor = true;
               notifyGameStateUpdate();
            }}
         >
            <img src={Restitutor} style={{ width: "100%", display: "block" }} />
         </div>
      </Tippy>
   );
}
