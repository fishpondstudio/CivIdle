import { Action } from "./Action";

export default class Repeat extends Action {
   action: Action;
   times: number;
   n = 0;

   constructor(action: Action, times = -1) {
      super();
      this.action = action;
      this.times = times;
   }

   tick(delta: number): boolean {
      if (this.action.tick(delta)) {
         this.n++;
         if (this.times >= 0 && this.n >= this.times) {
            return true;
         }
         // reset delta!
         this.reset();
      }
      return false;
   }

   override reset() {
      super.reset();
      this.action.reset();
      return this;
   }
}
