import { useEffect, useRef } from "react";
import { Building } from "../definitions/BuildingDefinitions";
import { Tick } from "../logic/TickLogic";
import { IBuildingComponentProps } from "./BuildingPage";

const WikipediaCache: Partial<Record<Building, string>> = {};

export function BuildingWikipediaComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const type = gameState.tiles[xy].building?.type;
   if (!type) {
      return null;
   }
   const wikipedia = Tick.current.buildings[type].wikipedia;
   if (!wikipedia) {
      return null;
   }
   const iframeEl = useRef<HTMLIFrameElement>(null);
   useEffect(() => {
      if (!iframeEl.current) {
         return;
      }
      const cache = WikipediaCache[type];
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
            WikipediaCache[type] = t;
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
   }, [type]);
   return (
      <iframe
         ref={iframeEl}
         style={{ width: "100%", height: "400px", background: "#fff", marginBottom: "10px" }}
      />
   );
}
