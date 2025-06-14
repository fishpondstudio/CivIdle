class AverageProvider {
   private readonly _history: number[];
   private readonly _decayRatio: number;

   private _currentIndex: number;
   private _average = 0;

   constructor(windowSize: number, decayRatio: number) {
      this._history = new Array(windowSize);
      this._decayRatio = decayRatio;

      this._currentIndex = 0;

      for (let i = 0; i < windowSize; i++) {
         this._history[i] = 0;
      }
   }

   next(input: number): number {
      const { _history: history, _decayRatio: decayRatio } = this;
      const historyLength = history.length;

      this._currentIndex = this._currentIndex < historyLength - 1 ? this._currentIndex + 1 : 0;
      history[this._currentIndex] = input;

      let weightedSum = 0;
      let weight = 0;

      for (let i = this._currentIndex + 1; i < historyLength; i++) {
         weightedSum = (weightedSum + history[i]) * decayRatio;
         weight = (weight + 1) * decayRatio;
      }
      for (let i = 0; i <= this._currentIndex; i++) {
         weightedSum = (weightedSum + history[i]) * decayRatio;
         weight = (weight + 1) * decayRatio;
      }

      this._average = weightedSum / weight;

      return this._average;
   }

   absDev(): number {
      let errSum = 0;

      for (let i = 0, j = this._history.length; i < j; i++) {
         errSum += Math.abs(this._history[i] - this._average);
      }

      return errSum / this._history.length;
   }
}

export interface IObjectPoolOptions {
   capacityRatio?: number;
   decayRatio?: number;
   reserve?: number;
}

interface IObjectPoolFuncs<T> {
   create: () => T;
   onAllocate?: (obj: T) => void;
   onRelease?: (obj: T) => void;
}

export class ObjectPool<T> {
   protected _freeList: T[];
   protected _freeCount: number;
   protected _reserveCount: number;

   protected _borrowRate: number;
   protected _returnRate: number;
   protected _flowRate: number;
   protected _borrowRateAverage: number;
   protected _marginAverage: number;

   private readonly _capacityRatio: number;
   private readonly _decayRatio: number;
   private readonly _borrowRateAverageProvider: AverageProvider;
   private readonly _marginAverageProvider: AverageProvider;

   constructor(
      private readonly funcs: IObjectPoolFuncs<T>,
      options: IObjectPoolOptions = {},
   ) {
      this._freeList = [];

      this._freeCount = 0;

      this._borrowRate = 0;
      this._returnRate = 0;
      this._flowRate = 0;
      this._borrowRateAverage = 0;

      this._reserveCount = options.reserve ?? 0;
      this._capacityRatio = options.capacityRatio ?? 1.2;
      this._decayRatio = options.decayRatio ?? 0.67;
      this._marginAverage = 0;
      this._borrowRateAverageProvider = new AverageProvider(128, this._decayRatio);
      this._marginAverageProvider = new AverageProvider(128, this._decayRatio);
   }

   protected get capacity(): number {
      return this._freeList.length;
   }

   protected set capacity(cp: number) {
      this._freeList.length = Math.ceil(cp);
   }

   allocate(): T {
      ++this._borrowRate;
      ++this._flowRate;
      const obj = this._freeCount > 0 ? this._freeList[--this._freeCount] : this.funcs.create();
      this.funcs.onAllocate?.(obj);
      return obj;
   }

   allocateArray(lengthOrArray: number | T[]): T[] {
      let array: T[];
      let length: number;

      if (Array.isArray(lengthOrArray)) {
         array = lengthOrArray;
         length = lengthOrArray.length;
      } else {
         length = lengthOrArray;
         array = new Array(length);
      }

      this._borrowRate += length;
      this._flowRate += length;

      let filled = 0;

      // Allocate as many objects from the existing pool
      if (this._freeCount > 0) {
         const pool = this._freeList;
         const poolFilled = Math.min(this._freeCount, length);
         let poolSize = this._freeCount;

         for (let i = 0; i < poolFilled; i++) {
            array[filled] = pool[poolSize - 1];
            this.funcs.onAllocate?.(array[filled]);
            ++filled;
            --poolSize;
         }

         this._freeCount = poolSize;
      }

      // Construct the rest of the allocation
      while (filled < length) {
         array[filled] = this.funcs.create();
         this.funcs.onAllocate?.(array[filled]);
         ++filled;
      }

      return array;
   }

   release(object: T): void {
      ++this._returnRate;
      --this._flowRate;

      if (this._freeCount === this.capacity) {
         this.capacity *= this._capacityRatio;
      }

      this._freeList[this._freeCount] = object;
      this.funcs.onRelease?.(object);
      ++this._freeCount;
   }

   releaseArray(array: T[]): void {
      this._returnRate += array.length;
      this._flowRate -= array.length;

      if (this._freeCount + array.length > this.capacity) {
         // Ensure we have enough capacity to insert the release objects
         this.capacity = Math.max(this.capacity * this._capacityRatio, this._freeCount + array.length);
      }

      // Place objects into pool list
      for (let i = 0, j = array.length; i < j; i++) {
         this._freeList[this._freeCount] = array[i];
         this.funcs.onRelease?.(array[i]);
         ++this._freeCount;
      }
   }

   reserve(count: number): void {
      this._reserveCount = count;

      if (this._freeCount < count) {
         const diff = this._freeCount - count;

         for (let i = 0; i < diff; i++) {
            this._freeList[this._freeCount] = this.funcs.create();
            ++this._freeCount;
         }
      }
   }

   limit(count: number): void {
      if (this._freeCount > count) {
         const oldCapacity = this.capacity;

         if (oldCapacity > count * this._capacityRatio) {
            this.capacity = count * this._capacityRatio;
         }

         const excessBound = Math.min(this._freeCount, this.capacity);

         for (let i = count; i < excessBound; i++) {
            // @ts-expect-error
            this._freeList[i] = null;
         }
      }
   }

   public readonly gcTick = (): void => {
      this._borrowRateAverage = this._borrowRateAverageProvider.next(this._borrowRate);
      this._marginAverage = this._marginAverageProvider.next(this._freeCount - this._borrowRate);

      const absDev = this._borrowRateAverageProvider.absDev();

      this._flowRate = 0;
      this._borrowRate = 0;
      this._returnRate = 0;

      const poolSize = this._freeCount;
      const poolCapacity = this._freeList.length;

      // If the pool is small enough, it shouldn't really matter
      if (poolSize < 128 && this._borrowRateAverage < 128 && poolCapacity < 128) {
         return;
      }

      // If pool is say, 2x, larger than borrowing rate on average (adjusted for variance/abs-dev), then downsize.
      const threshold = Math.max(this._borrowRateAverage * (this._capacityRatio - 1), this._reserveCount);

      if (this._freeCount > threshold + absDev) {
         const newCap = threshold + absDev;

         this.capacity = Math.min(this._freeList.length, Math.ceil(newCap));
         this._freeCount = this._freeList.length;
      }
   };
}
