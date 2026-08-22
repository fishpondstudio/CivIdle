import Tippy, { type TippyProps } from "@tippyjs/react";
import { forwardRef, useMemo, useState } from "react";
import type { Plugin } from "tippy.js";

// https://gist.github.com/atomiks/520f4b0c7b537202a23a3059d4eec908
export const LazyTippy = forwardRef<Element, TippyProps>(function LazyTippy(props, ref) {
   const [mounted, setMounted] = useState(false);

   const lazyPlugin = useMemo<Plugin>(
      () => ({
         fn: () => ({
            onTrigger: () => setMounted(true),
            onHidden: () => setMounted(false),
         }),
      }),
      [],
   );

   const computedProps: TippyProps = { ...props };
   computedProps.plugins = [lazyPlugin, ...(props.plugins ?? [])];

   if (props.render) {
      const render = props.render;
      computedProps.render = (...args) => (mounted ? render(...args) : "");
   } else {
      computedProps.content = mounted ? props.content : "";
   }

   return <Tippy {...computedProps} ref={ref} />;
});
