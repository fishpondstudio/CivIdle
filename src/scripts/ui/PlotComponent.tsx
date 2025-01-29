import { useLayoutEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { FormatNumber } from "./HelperComponents";

export function PlotComponent({
   title,
   data,
   series,
}: { title: string; data: uPlot.AlignedData; series: uPlot.Series }): React.ReactNode {
   const element = useRef<HTMLDivElement>(null);
   const plot = useRef<uPlot | null>(null);

   // biome-ignore lint/correctness/useExhaustiveDependencies: Perf
   useLayoutEffect(() => {
      if (!element.current) return;
      plot.current = new uPlot(
         {
            width: 0,
            height: 50,
            pxAlign: false,
            cursor: {
               show: false,
            },
            select: {
               top: 0,
               left: 0,
               width: 0,
               height: 0,
               show: false,
            },
            legend: {
               show: false,
            },
            scales: {
               x: {
                  time: false,
               },
            },
            axes: [
               {
                  show: false,
               },
               {
                  show: false,
               },
            ],
            series: [{}, series],
         },
         [],
         element.current,
      );

      return () => {
         plot.current?.destroy();
      };
   }, []);
   plot.current?.setData(data);
   plot.current?.setSize({ height: 50, width: element.current?.clientWidth ?? 0 });
   return (
      <div>
         <div className="inset-shallow white" ref={element}></div>
         <div className="row f1 text-desc text-small mt5">
            <div>
               <FormatNumber value={data[1][0]} />
            </div>
            <div className="f1 text-center">{title}</div>
            <div>
               <FormatNumber value={data[1][data[1].length - 1]} />
            </div>
         </div>
      </div>
   );
}
