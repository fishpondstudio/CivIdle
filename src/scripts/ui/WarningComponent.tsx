import classNames from "classnames";
import type { PropsWithChildren } from "react";
import error from "../../images/error.png";
import info from "../../images/info.png";
import question from "../../images/question.png";
import warning from "../../images/warning.png";

const ICONS = {
   warning,
   error,
   info,
   question,
};

export function WarningComponent({
   children,
   icon,
   className,
   onClick,
   style,
}: PropsWithChildren<{
   icon: "warning" | "error" | "info" | "question";
   className?: string;
   onClick?: React.MouseEventHandler<HTMLDivElement>;
   style?: React.CSSProperties;
}>): React.ReactNode {
   const classList: Record<string, boolean> = { "warning-banner row": true, pointer: !!onClick };
   if (className) {
      classList[className] = true;
   }
   return (
      <div className={classNames(classList)} onClick={onClick} style={style}>
         <img src={ICONS[icon]} style={{ alignSelf: "flex-start", margin: "2px 5px 2px 0" }} />
         <div className="f1">{children}</div>
      </div>
   );
}
