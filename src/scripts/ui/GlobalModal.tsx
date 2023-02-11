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

export const ShowToast = new TypedEvent<string>();
export const HideToast = new TypedEvent<void>();

export function GlobalToast() {
   const [content, setContent] = useState<string | null>(null);

   useTypedEvent(ShowToast, (e) => {
      setContent(e);
      setTimeout(() => setContent(null), 3500);
   });

   useTypedEvent(HideToast, (e) => {
      setContent(null);
   });

   if (!content) {
      return null;
   }

   return <div className="toast">{content}</div>;
}
