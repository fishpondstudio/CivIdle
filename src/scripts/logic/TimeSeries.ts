class TimeSeriesDefinition {
   tick: number[] = [];
   deltaTick: number[] = [];

   empireValue: number[] = [];
   empireValueDelta: number[] = [];

   science: number[] = [];
   scienceDelta: number[] = [];

   public add(tick: number, empireValue: number, science: number): void {
      this.tick.push(tick);

      this.empireValue.push(empireValue);
      if (this.empireValue.length > 1) {
         this.deltaTick.push(tick);
         this.empireValueDelta.push(
            this.empireValue[this.empireValue.length - 1] - this.empireValue[this.empireValue.length - 2],
         );
      }

      this.science.push(science);
      if (this.science.length > 1) {
         this.scienceDelta.push(
            this.science[this.science.length - 1] - this.science[this.science.length - 2],
         );
      }

      while (this.tick.length > 100) {
         this.tick.shift();
      }

      while (this.empireValue.length > 100) {
         this.empireValue.shift();
      }

      while (this.science.length > 100) {
         this.science.shift();
      }
   }
}

export const TimeSeries = new TimeSeriesDefinition();
