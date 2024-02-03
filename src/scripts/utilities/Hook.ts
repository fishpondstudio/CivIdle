import { type DependencyList, useEffect, useState } from "react";
import { type Shortcut, getShortcuts } from "../../../shared/logic/Shortcut";
import type { TypedEvent } from "../../../shared/utilities/TypedEvent";

export function makeObservableHook<T>(event: TypedEvent<T>, getter: () => T) {
   return function observe(): T {
      const [_, setter] = useState(0);
      function handleEvent(data: T): void {
         setter((old) => old + 1);
      }
      useEffect(() => {
         event.on(handleEvent);
         return () => {
            event.off(handleEvent);
         };
      }, [event]);
      return getter();
   };
}

export function useTypedEvent<T>(event: TypedEvent<T>, listener: (e: T) => void) {
   return useEffect(() => {
      event.on(listener);
      return () => {
         event.off(listener);
      };
   }, [event, listener]);
}

export function refreshOnTypedEvent<T>(event: TypedEvent<T>) {
   const [_, setter] = useState(0);
   function listener() {
      setter((old) => old + 1);
   }
   useEffect(() => {
      event.on(listener);
      return () => {
         event.off(listener);
      };
   }, [event]);
}

export function useShortcut(shortcut: Shortcut, callback: () => void, deps: DependencyList) {
   useEffect(() => {
      const shortcuts = getShortcuts();
      shortcuts[shortcut] = callback;
      return () => {
         shortcuts[shortcut] = undefined;
      };
   }, [shortcut, callback, ...deps]);
}
