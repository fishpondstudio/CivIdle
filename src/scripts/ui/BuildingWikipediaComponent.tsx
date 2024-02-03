import { useEffect, useRef } from "react";
import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { IBuildingComponentProps } from "./BuildingPage";

const WikipediaCache: Map<Building, string> = new Map();

export function BuildingWikipediaComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
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
      <iframe
         ref={iframeEl}
         style={{ width: "100%", height: "400px", background: "#fff", marginBottom: "10px" }}
      />
   );
}
