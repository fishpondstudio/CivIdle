import { useEffect, useState } from "react";
import type { TypedEvent } from "./TypedEvent";

export function makeObservableHook<T>(event: TypedEvent<T>, initialValue: () => T) {
   return function observe(): T {
      const [getter, setter] = useState<T>(initialValue());
      function handleEvent(data: T): void {
         if (data && data === getter) {
            console.warn("makeObservableHook: data change event should return a copy", data);
         }
         setter(data);
      }
      useEffect(() => {
         event.on(handleEvent);
         return () => {
            event.off(handleEvent);
         };
      }, [event]);
      return getter;
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
   const [getter, setter] = useState(0);
   function listener() {
      setter((old) => old + 1);
   }
   useEffect(() => {
      event.on(listener);
      return () => {
         event.off(listener);
      };
   }, [event]);
   return getter;
}
