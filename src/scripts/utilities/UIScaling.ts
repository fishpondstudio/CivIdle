import { useLayoutEffect, useState } from "react";

/** Convert baseline design pixels (10px at 1x) to a root-relative CSS length. */
export function toRem(designPixels: number): string {
   return `${designPixels / 10}rem`;
}

/** Pixel-only APIs must use the computed root size, not the saved scale preference. */
export function useRemSize(): number {
   const [size, setSize] = useState(() =>
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
   );
   useLayoutEffect(() => {
      // Observe a rem-sized probe: root element dimensions need not change when its font changes.
      const probe = document.createElement("div");
      probe.style.cssText =
         "position:fixed;width:1rem;height:0;visibility:hidden;pointer-events:none;overflow:hidden";
      document.body.appendChild(probe);
      const update = () => setSize(Number.parseFloat(getComputedStyle(document.documentElement).fontSize));
      const observer = new ResizeObserver(update);
      observer.observe(probe);
      update();
      return () => {
         observer.disconnect();
         probe.remove();
      };
   }, []);
   return size;
}
