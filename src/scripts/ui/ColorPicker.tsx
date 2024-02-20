import { useEffect, useRef, useState } from "react";

export function ColorPicker({
   value,
   onChange,
   timeout,
}: { value: string; onChange: (newVal: string) => void; timeout: number }): React.ReactNode {
   const [color, setColor] = useState(value);
   useEffect(() => {
      setColor(value);
   }, [value]);
   const timer = useRef(0);
   return (
      <input
         type="color"
         value={color}
         onChange={(v) => {
            const color = v.target.value;
            setColor(color);
            if (timer.current) {
               clearTimeout(timer.current);
            }
            timer.current = window.setTimeout(() => onChange(color), timeout);
         }}
      />
   );
}
