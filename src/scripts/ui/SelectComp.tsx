import { autoUpdate, size, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { useState } from "react";
import { cls } from "../../../shared/utilities/Helper";

export interface ISelectItem<T extends string | number | null> {
   label: React.ReactNode;
   value: T;
}

export function SelectComp<T extends string | number | null>({
   data,
   value,
   onChange,
}: {
   data: (ISelectItem<T> | null)[];
   value: T;
   onChange: (value: T) => void;
}): React.ReactNode {
   const [isOpen, setIsOpen] = useState(false);
   const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: setIsOpen,
      middleware: [
         size({
            apply({ availableHeight, rects, elements }) {
               Object.assign(elements.floating.style, {
                  minWidth: `${rects.reference.width}px`,
               });
               elements.floating.style.maxHeight = `${Math.max(0, availableHeight)}px`;
            },
            padding: 50,
         }),
      ],
      placement: "bottom-end",
      whileElementsMounted: autoUpdate,
   });
   const click = useClick(context);
   const dismiss = useDismiss(context);
   const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);
   return (
      <>
         <div ref={refs.setReference} className="inset-deep-2 white pointer" {...getReferenceProps()}>
            <div className="row">
               <div className="f1 select-comp-value">{data.find((item) => item?.value === value)?.label}</div>
               <button style={{ padding: 0, minHeight: "24px", width: "22px" }}>
                  <div className="m-icon" style={{ margin: "-5px" }}>
                     arrow_drop_down
                  </div>
               </button>
            </div>
         </div>
         {isOpen && (
            <div
               ref={refs.setFloating}
               style={{
                  border: "1px solid #666",
                  background: "#fff",
                  zIndex: 1,
                  overflowY: "auto",
                  ...floatingStyles,
               }}
               {...getFloatingProps()}
            >
               {data.map((item) => {
                  if (!item) {
                     return null;
                  }
                  return (
                     <div
                        className={cls("select-comp-item", item.value === value ? "selected" : "")}
                        key={item.value}
                        onClick={() => {
                           onChange(item.value);
                           setIsOpen(false);
                        }}
                     >
                        {item.label}
                     </div>
                  );
               })}
            </div>
         )}
      </>
   );
}
