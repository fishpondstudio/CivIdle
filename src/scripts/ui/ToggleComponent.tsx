import { playClick } from "../visuals/Sound";
import { RenderHTML } from "./RenderHTMLComponent";

export function ToggleComponent({
   title,
   contentHTML,
   value,
   onValueChange,
}: {
   title: string;
   contentHTML: string;
   value: boolean;
   onValueChange: (newValue: boolean) => void;
}): React.ReactNode {
   return (
      <div className="row">
         <div className="f1">
            <div>{title}</div>
            <RenderHTML className="text-desc text-small" html={contentHTML} />
         </div>
         <div
            onClick={() => {
               playClick();
               onValueChange(!value);
            }}
            className="ml10 pointer"
         >
            {value ? (
               <div className="m-icon text-green">toggle_on</div>
            ) : (
               <div className="m-icon text-grey">toggle_off</div>
            )}
         </div>
      </div>
   );
}
