import type { ReactNode } from "react";
import { useState } from "react";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { useTypedEvent } from "../utilities/Hook";
import { RenderHTML } from "./RenderHTMLComponent";

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

let toastTimeout = 0;

export function GlobalToast(): React.ReactNode {
   const [content, setContent] = useState<string | null>(null);

   useTypedEvent(showToastEvent, (e) => {
      setContent(e);
      if (toastTimeout) {
         clearTimeout(toastTimeout);
      }
      toastTimeout = window.setTimeout(() => setContent(null), 5000);
   });

   useTypedEvent(hideToastEvent, (e) => {
      setContent(null);
   });

   if (!content) {
      return null;
   }

   return <RenderHTML className="toast" html={content} />;
}
