import type { ReactNode} from "react";
import { useState } from "react";
import { useTypedEvent } from "../utilities/Hook";
import { TypedEvent } from "../utilities/TypedEvent";

const showModalEvent = new TypedEvent<ReactNode>();
const hideModalEvent = new TypedEvent<void>();

export function showModal(modal: ReactNode) {
   showModalEvent.emit(modal);
}

export function hideModal() {
   hideModalEvent.emit();
}

export function GlobalModal(): React.ReactNode {
   const [content, setContent] = useState<ReactNode>(null);

   useTypedEvent(showModalEvent, (e) => {
      setContent(e);
   });

   useTypedEvent(hideModalEvent, () => {
      setContent(null);
   });

   if (!content) {
      return null;
   }

   return <div className="overlay">{content}</div>;
}

const showToastEvent = new TypedEvent<string>();
const hideToastEvent = new TypedEvent<void>();

export function showToast(toast: string) {
   showToastEvent.emit(toast);
}

export function GlobalToast(): React.ReactNode {
   const [content, setContent] = useState<string | null>(null);

   useTypedEvent(showToastEvent, (e) => {
      setContent(e);
      setTimeout(() => setContent(null), 3500);
   });

   useTypedEvent(hideToastEvent, (e) => {
      setContent(null);
   });

   if (!content) {
      return null;
   }

   return <div className="toast">{content}</div>;
}
