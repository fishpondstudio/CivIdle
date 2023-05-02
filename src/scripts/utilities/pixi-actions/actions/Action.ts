import Actions from "../Actions";

let id = 0;

export default abstract class Action {
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

   play() {
      Actions.play(this);
      return this;
   }

   isPlaying(): boolean {
      return Actions.isPlaying(this);
   }

   pause() {
      Actions.pause(this);
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
