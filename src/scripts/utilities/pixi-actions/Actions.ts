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
   static actions: Record<number, Action> = {};

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
      this.actions[action.id] = action;
   }

   static isPlaying(action: Action): boolean {
      return !!this.actions[action.id];
   }

   static pause(action: Action) {
      delete this.actions[action.id];
   }

   static clear(target: object) {
      for (const id in this.actions) {
         const action = this.actions[id];
         if (action instanceof TargetAction && action.target == target) {
            delete this.actions[id];
         }
      }
   }

   static tick(delta: number) {
      for (const id in this.actions) {
         const action = this.actions[id];
         const done = action.tick(delta);
         if (done) {
            action.done = true;
            delete this.actions[id];
            // Are there any queued events?
            for (let j = 0; j < action.queued.length; j++) {
               Actions.play(action.queued[j]);
            }
            action.queued = [];
         }
      }
   }
}
