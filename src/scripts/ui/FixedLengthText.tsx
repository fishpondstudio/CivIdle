import Tippy from "@tippyjs/react";

export function FixedLengthText({ text, length }: { text: string; length: number }): React.ReactNode {
   if (text.length <= length) {
      return text;
   }
   return (
      <Tippy content={text}>
         <span>{text.substring(0, length - 3)}...</span>
      </Tippy>
   );
}
