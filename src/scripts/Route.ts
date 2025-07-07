import React, { useState } from "react";
import { getGameState } from "../../shared/logic/GameStateLogic";
import { clearShortcuts } from "../../shared/logic/Shortcut";
import type { Tile } from "../../shared/utilities/Helper";
import type { TypedEvent } from "../../shared/utilities/TypedEvent";
import { useFloatingMode } from "./Global";
import { LoadingPage } from "./ui/LoadingPage";
import { TilePage } from "./ui/TilePage";
import { useTypedEvent } from "./utilities/Hook";
import { playClick } from "./visuals/Sound";

export function Route({ event }: { event: TypedEvent<RouteChangeEvent> }): React.ReactNode {
   const [{ component, params }, setRoute] = useState<RouteChangeEvent>({
      component: LoadingPage,
      params: {},
   });
   useTypedEvent(event, (e) => {
      if (import.meta.env.DEV) {
         if (e.component === TilePage) {
            console.log(getGameState().tiles.get(e.params.xy as Tile));
         }
      }
      if (e.component !== LoadingPage) {
         playClick();
      }
      clearShortcuts();
      setRoute(e);
   });
   const isFloating = useFloatingMode();
   if (isFloating) {
      return null;
   }
   return React.createElement("div", { id: "game-ui" }, React.createElement(component, params));
}

export interface RouteChangeEvent {
   component: React.ElementType;
   params: Record<string, unknown>;
}
