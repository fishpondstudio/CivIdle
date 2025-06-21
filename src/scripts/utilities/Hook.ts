import { useEffect, useReducer, type DependencyList } from "react";
import { getShortcuts, type Shortcut } from "../../../shared/logic/Shortcut";
import type { TypedEvent } from "../../../shared/utilities/TypedEvent";

export function makeObservableHook<T>(event: TypedEvent<T>, getter: () => T) {
   return function observe(): T {
      const [_, update] = useReducer(reducer, 0);
      useEffect(() => {
         event.on(update);
         return () => {
            event.off(update);
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

export function refreshOnTypedEvent<T>(event: TypedEvent<T>): number {
   const [handle, update] = useReducer(reducer, 0);
   useEffect(() => {
      event.on(update);
      return () => {
         event.off(update);
      };
   }, [event]);
   return handle;
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

const reducer = (value: number) => (value + 1) % 1000000;

export function useForceUpdate(): () => void {
   const [, update] = useReducer(reducer, 0);
   return update;
}
