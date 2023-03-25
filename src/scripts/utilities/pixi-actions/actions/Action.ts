import Actions from "../Actions";

export default abstract class Action {
   done = false;
   queued: Array<Action> = [];
   abstract tick(progress: number): boolean;

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

   finish() {
      return this;
   }
}
