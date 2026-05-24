import Tippy from "@tippyjs/react";

export function FixedLengthText({
   text,
   style,
   length,
}: { text: string; style?: React.CSSProperties; length: number }): React.ReactNode {
   if (text.length <= length) {
      return <span style={style}>{text}</span>;
   }
   return (
      <Tippy content={text}>
         <span style={style}>{text.substring(0, length - 3)}...</span>
      </Tippy>
   );
}
