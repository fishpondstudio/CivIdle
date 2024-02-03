import { Action } from "./Action";

export default class Sequence extends Action {
   index = 0;
   actions: Array<Action>;

   constructor(...actions: Array<Action>) {
      super();
      this.actions = actions;
   }

   tick(delta: number): boolean {
      // If empty, we are done!
      if (this.index === this.actions.length) return true;

      // Otherwise, tick the first element
      if (this.actions[this.index].tick(delta)) {
         this.index++;
      }
      return false;
   }

   override reset() {
      super.reset();
      this.index = 0;
      for (const i in this.actions) {
         this.actions[i].reset();
      }
      return this;
   }
}
