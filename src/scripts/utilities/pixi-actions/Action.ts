import { actions } from "./ActionStorage";

let id = 0;

export abstract class Action {
   public done = false;
   public queued: Array<Action> = [];
   public readonly id: number;

   abstract tick(progress: number): boolean;

   constructor() {
      this.id = ++id;
   }

   queue(after: Action) {
      this.queued.push(after);
      return this;
   }

   start() {
      actions.set(this.id, this);
      return this;
   }

   isPlaying(): boolean {
      return actions.has(this.id);
   }

   pause() {
      actions.delete(this.id);
      return this;
   }

   reset() {
      this.done = false;
      return this;
   }

   stop() {
      this.pause().reset();
      return this;
   }
}
