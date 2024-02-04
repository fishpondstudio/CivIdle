import Tippy from "@tippyjs/react";
import React from "react";
import { type Placement } from "tippy.js";
import "tippy.js/dist/tippy.css";

export function TextWithHelp({
   children,
   help,
   placement,
   className,
   noStyle,
}: React.PropsWithChildren<{
   help: string | undefined;
   placement?: Placement;
   size?: "small" | "medium" | "large" | "xlarge" | "fit";
   className?: string;
   noStyle?: boolean;
}>): React.ReactNode {
   if (!noStyle) {
      className += " with-help";
   }
   return (
      <Tippy content={help} placement={placement ?? "auto"}>
         <span className={className}>{children}</span>
      </Tippy>
   );
}
