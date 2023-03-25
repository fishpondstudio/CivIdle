import * as PIXI from "pixi.js";
import Action from "./actions/Action";
import Delay from "./actions/Delay";
import Parallel from "./actions/Parallel";
import Repeat from "./actions/Repeat";
import RunFunc from "./actions/RunFunc";
import Sequence from "./actions/Sequence";
import { TargetAction } from "./actions/TargetAction";
import { Easing, EasingFunction } from "./Easing";

export default class Actions {
   static actions: Array<Action> = [];

   static to<T extends Record<string, any>>(
      target: T,
      targetValue: Partial<Record<keyof T, any>>,
      seconds: number,
      interpolation: EasingFunction = Easing.Linear
   ): Action {
      return new TargetAction(target, targetValue, seconds, interpolation);
   }

   static remove(target: PIXI.DisplayObject): Action {
      return Actions.runFunc(() => {
         if (target.parent != null) target.parent.removeChild(target);
      });
   }

   static delay(seconds: number): Action {
      return new Delay(seconds);
   }

   static runFunc(fn: () => void): Action {
      return new RunFunc(fn);
   }

   static sequence(...actions: Array<Action>): Action {
      return new Sequence(...actions);
   }

   static parallel(...actions: Array<Action>): Action {
      return new Parallel(...actions);
   }

   static repeat(action: Action, times = -1): Action {
      return new Repeat(action, times);
   }

   static play(action: Action) {
      this.actions.push(action);
   }

   static isPlaying(action: Action): boolean {
      return this.actions.indexOf(action) >= 0;
   }

   static pause(action: Action) {
      const index = this.actions.indexOf(action);
      if (index >= 0) {
         this.actions.splice(index, 1);
      }
   }

   static clear(target: object) {
      for (let i = this.actions.length - 1; i >= 0; i--) {
         const action: Action = this.actions[i];

         if (!target || (action instanceof TargetAction && action.target == target)) {
            this.actions.splice(i, 1);
         }
      }
   }

   static tick(delta: number) {
      for (let i = this.actions.length - 1; i >= 0; i--) {
         const action: Action = this.actions[i];
         // Otherwise, we tick the action
         const done = action.tick(delta);
         if (done) {
            action.done = true;
            this.actions.splice(i, 1);

            // Are there any queued events?
            for (let j = 0; j < action.queued.length; j++) {
               Actions.play(action.queued[j]);
            }
            action.queued = [];
         }
      }
   }
}
