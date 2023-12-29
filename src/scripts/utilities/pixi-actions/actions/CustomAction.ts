import type { EasingFunction } from "../Easing";
import { Easing } from "../Easing";
import { Action } from "./Action";

export class CustomAction<T> extends Action {
   private readonly interpolation: EasingFunction;

   private readonly initialValue: T;
   private readonly targetValue: T;
   private time = 0;
   private readonly seconds: number;
   private readonly setter: (value: T) => void;
   private readonly getter: () => T;
   private readonly interpolator: (initial: T, target: T, factor: number) => T;

   constructor(
      getter: () => T,
      setter: (value: T) => void,
      interpolator: (initial: T, target: T, factor: number) => T,
      targetValue: T,
      seconds: number,
      interpolation: EasingFunction = Easing.Linear,
   ) {
      super();
      this.interpolation = interpolation;
      this.getter = getter;
      this.setter = setter;
      this.interpolator = interpolator;
      this.targetValue = targetValue;
      this.initialValue = this.getter();
      this.seconds = seconds;
   }

   tick(delta: number): boolean {
      this.time += delta;
      const factor: number = this.interpolation(this.timeDistance);
      this.setter(this.interpolator(this.initialValue, this.targetValue, factor));
      return this.timeDistance >= 1;
   }

   get timeDistance(): number {
      return Math.min(1, this.time / this.seconds);
   }

   override reset() {
      super.reset();
      this.time = 0;
      return this;
   }
}
