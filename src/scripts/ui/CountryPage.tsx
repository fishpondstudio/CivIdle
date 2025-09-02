import { OnKeydown } from "../../../shared/logic/Shortcut";
import { clamp } from "../../../shared/utilities/Helper";
import type { UnicodeText } from "../../../shared/utilities/UnicodeText";
import { CountryMapping } from "../scenes/ConquestScene";
import { useForceUpdate, useTypedEvent } from "../utilities/Hook";
import { MenuComponent } from "./MenuComponent";
import { TitleBarComponent } from "./TitleBarComponent";

export function CountryPage({ text }: { text?: UnicodeText }): React.ReactNode {
   const forceUpdate = useForceUpdate();

   if (text) {
      const result: Record<string, { x: number; y: number; angle: number; size: number }> = {};
      CountryMapping.forEach(({ text }) => {
         result[text.text] = {
            x: text.x,
            y: text.y,
            angle: text.angle,
            size: clamp(text.size, 0, Number.POSITIVE_INFINITY),
         };
      });
      localStorage.setItem("CountryMapping", JSON.stringify(result));
      console.log(JSON.stringify(result));
   }

   useTypedEvent(OnKeydown, (e) => {
      if (text) {
         switch (e.key.toLowerCase()) {
            case "a":
               text.x -= e.shiftKey ? 0.1 : 1;
               forceUpdate();
               break;
            case "d":
               text.x += e.shiftKey ? 0.1 : 1;
               forceUpdate();
               break;
            case "w":
               text.y -= e.shiftKey ? 0.1 : 1;
               forceUpdate();
               break;
            case "s":
               text.y += e.shiftKey ? 0.1 : 1;
               forceUpdate();
               break;
            case "1":
               text.angle -= 1;
               forceUpdate();
               break;
            case "2":
               text.angle = 0;
               forceUpdate();
               break;
            case "3":
               text.angle += 1;
               forceUpdate();
               break;
            case "q":
               text.size -= 0.1;
               forceUpdate();
               break;
            case "e":
               text.size += 0.1;
               forceUpdate();
               break;
         }
      }
   });

   return (
      <div className="window">
         <TitleBarComponent>{text?.text ?? "Select a Country"}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <div className="row">
               <input
                  type="number"
                  step="1"
                  className="f1 w100"
                  value={text?.x ?? 0}
                  onChange={(e) => {
                     if (text) {
                        text.x = Number(e.target.value);
                        forceUpdate();
                     }
                  }}
               />
               <input
                  type="number"
                  step="1"
                  className="f1 w100"
                  value={text?.y ?? 0}
                  onChange={(e) => {
                     if (text) {
                        text.y = Number(e.target.value);
                        forceUpdate();
                     }
                  }}
               />
               <input
                  type="number"
                  step="1"
                  className="f1 w100"
                  value={text?.angle ?? 0}
                  onChange={(e) => {
                     if (text) {
                        text.angle = Number(e.target.value);
                        forceUpdate();
                     }
                  }}
               />
               <input
                  type="number"
                  step="0.1"
                  className="f1 w100"
                  value={text?.size ?? 0}
                  onChange={(e) => {
                     if (text) {
                        text.size = Number(e.target.value);
                        forceUpdate();
                     }
                  }}
               />
            </div>
         </div>
      </div>
   );
}
