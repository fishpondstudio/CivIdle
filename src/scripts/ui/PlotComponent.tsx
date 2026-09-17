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

   useLayoutEffect(() => {
      const container = element.current;
      if (!container) return;
      const instance = new uPlot(
         {
            width: Math.max(1, container.clientWidth),
            height: Math.max(1, container.clientHeight),
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
         container,
      );
      plot.current = instance;
      let frame = 0;
      const observer = new ResizeObserver(([entry]) => {
         cancelAnimationFrame(frame);
         frame = requestAnimationFrame(() => {
            const width = Math.floor(entry.contentRect.width);
            const height = Math.floor(entry.contentRect.height);
            if (width > 0 && height > 0) instance.setSize({ width, height });
         });
      });
      observer.observe(container);
      return () => {
         observer.disconnect();
         cancelAnimationFrame(frame);
         instance.destroy();
         plot.current = null;
      };
   }, [series]);
   // biome-ignore lint/correctness/useExhaustiveDependencies: A series change recreates the plot, so reapply its data.
   useLayoutEffect(() => {
      plot.current?.setData(data);
   }, [data, series]);
   return (
      <div>
         <div
            className="inset-shallow white"
            ref={element}
            style={{ height: "calc(5rem + 2px)", minWidth: 0, overflow: "hidden" }}
         ></div>
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
