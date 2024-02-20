import Tippy from "@tippyjs/react";
import React from "react";
import { type Placement } from "tippy.js";
import "tippy.js/dist/tippy.css";

export function TextWithHelp({
   children,
   content,
   placement,
   className,
   noStyle,
}: React.PropsWithChildren<{
   content: string | null | undefined;
   placement?: Placement;
   size?: "small" | "medium" | "large" | "xlarge" | "fit";
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
      <Tippy content={content} placement={placement ?? "auto"}>
         <span className={className}>{children}</span>
      </Tippy>
   );
}
