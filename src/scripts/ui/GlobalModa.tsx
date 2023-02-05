import { useState } from "react";
import { useTypedEvent } from "../utilities/Hook";
import { TypedEvent } from "../utilities/TypedEvent";

export const ShowModal = new TypedEvent<JSX.Element>();
export const HideModal = new TypedEvent<void>();

export function GlobalModal() {
   const [content, setContent] = useState<JSX.Element | null>(null);

   useTypedEvent(ShowModal, (e) => {
      setContent(e);
   });

   useTypedEvent(HideModal, () => {
      setContent(null);
   });

   if (!content) {
      return null;
   }

   return <div className="overlay">{content}</div>;
}
