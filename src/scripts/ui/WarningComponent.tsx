import { PropsWithChildren } from "react";
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
   bottom,
}: PropsWithChildren<{
   icon: "warning" | "error" | "info" | "question";
   bottom?: number;
}>): JSX.Element {
   return (
      <div className="warning-banner row" style={{ marginBottom: `${bottom ?? 0}px` }}>
         <img src={ICONS[icon]} style={{ alignSelf: "flex-start", margin: "2px 5px 2px 0" }} />
         <div className="f1">{children}</div>
      </div>
   );
}
