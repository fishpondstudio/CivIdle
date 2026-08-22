import type React from "react";
import type { Placement } from "tippy.js";
import "tippy.js/dist/tippy.css";
import { LazyTippy } from "./LazyTippy";

export function TextWithHelp({
   children,
   content,
   placement,
   className,
   noStyle,
}: React.PropsWithChildren<{
   content: string | null | undefined;
   placement?: Placement;
   className?: string;
   noStyle?: boolean;
}>): React.ReactNode {
   if (!content) {
      return children;
   }
   if (!noStyle) {
      className += " with-help";
   }
   return (
      <LazyTippy content={content} placement={placement ?? "auto"}>
         <span className={className}>{children}</span>
      </LazyTippy>
   );
}
