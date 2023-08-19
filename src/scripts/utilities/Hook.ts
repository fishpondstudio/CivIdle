import { useEffect, useState } from "react";
import { TypedEvent } from "./TypedEvent";

export function makeObservableHook<T>(event: TypedEvent<T>, initialValue: () => T) {
   return function observe(): T {
      const [getter, setter] = useState<T>(initialValue);
      useEffect(() => {
         function handleEvent(data: T): void {
            setter(data);
         }
         event.on(handleEvent);
         return () => {
            event.off(handleEvent);
         };
      }, []);
      return getter;
   };
}

export function useTypedEvent<T>(event: TypedEvent<T>, listener: (e: T) => void) {
   return useEffect(() => {
      event.on(listener);
      return () => {
         event.off(listener);
      };
   }, []);
}
