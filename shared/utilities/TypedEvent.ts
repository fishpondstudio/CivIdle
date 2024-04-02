export type Listener<T> = (event: T) => void;

export interface Disposable {
   dispose(): void;
}

/** passes through events as they happen. You will not get events from before you start listening */
export class TypedEvent<T> {
   private listeners: Listener<T>[] = [];
   private listenersOnce: Listener<T>[] = [];

   on = (listener: Listener<T>): Disposable => {
      this.listeners.push(listener);
      return {
         dispose: () => this.off(listener),
      };
   };

   once = (listener: Listener<T>): void => {
      this.listenersOnce.push(listener);
   };

   off = (listener: Listener<T>) => {
      const callbackIndex = this.listeners.indexOf(listener);
      if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
   };

   emit = (event: T) => {
      /** Update any general listeners */
      this.listeners.forEach((listener) => listener(event));

      /** Clear the `once` queue */
      if (this.listenersOnce.length > 0) {
         const toCall = this.listenersOnce;
         this.listenersOnce = [];
         toCall.forEach((listener) => listener(event));
      }
   };

   pipe = (te: TypedEvent<T>): Disposable => {
      return this.on((e) => te.emit(e));
   };
}
