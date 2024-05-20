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

const showToastEvent = new TypedEvent<{ timeout: number; content: string }>();
const hideToastEvent = new TypedEvent<void>();

export function showToast(content: string, timeout = 5000): void {
   showToastEvent.emit({ content, timeout });
}

export function hideToast(): void {
   if (toastTimeout) {
      clearTimeout(toastTimeout);
   }
   hideToastEvent.emit();
}

let toastTimeout = 0;

export function GlobalToast(): React.ReactNode {
   const [content, setContent] = useState<string | null>(null);

   useTypedEvent(showToastEvent, (e) => {
      setContent(e.content);
      if (toastTimeout) {
         clearTimeout(toastTimeout);
      }
      if (Number.isFinite(e.timeout)) {
         toastTimeout = window.setTimeout(() => setContent(null), e.timeout);
      }
   });

   useTypedEvent(hideToastEvent, (e) => {
      setContent(null);
   });

   if (!content) {
      return null;
   }

   return <RenderHTML className="toast" html={content} />;
}
