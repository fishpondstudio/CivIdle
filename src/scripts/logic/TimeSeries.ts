class TimeSeriesDefinition {
   tick: number[] = [];
   empireValue: number[] = [];
   science: number[] = [];

   public add(tick: number, empireValue: number, science: number): void {
      this.tick.push(tick);
      this.empireValue.push(empireValue);
      this.science.push(science);

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
