type QueueItem<T> = {
   promiseGenerator: () => Promise<T>;
   resolve: (value: T) => void;
   reject: (error: unknown) => void;
};

export class PromiseQueue<T = unknown> {
   private queue: QueueItem<T>[] = [];
   private pendingPromises = 0;
   private readonly maxConcurrent: number;

   constructor(maxConcurrent: number = Number.POSITIVE_INFINITY) {
      this.maxConcurrent = maxConcurrent;
   }

   enqueue(promiseGenerator: () => Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
         this.queue.push({ promiseGenerator, resolve, reject });
         this._dequeue();
      });
   }

   private async _dequeue(): Promise<void> {
      if (this.pendingPromises >= this.maxConcurrent) {
         return;
      }

      if (this.queue.length === 0) {
         return;
      }

      this.pendingPromises++;

      const item = this.queue.shift();
      if (!item) {
         this.pendingPromises--;
         return;
      }

      const { promiseGenerator, resolve, reject } = item;

      try {
         const result = await promiseGenerator();
         resolve(result);
      } catch (error) {
         reject(error);
      } finally {
         this.pendingPromises--;
         this._dequeue();
      }
   }
}
