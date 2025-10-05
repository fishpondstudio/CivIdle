import type { ReactNode } from "react";
import { useState } from "react";
import { cls } from "../../../shared/utilities/Helper";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { useTypedEvent } from "../utilities/Hook";
import { html } from "./RenderHTMLComponent";

const showModalEvent = new TypedEvent<ReactNode>();
const hideModalEvent = new TypedEvent<void>();

export function showModal(modal: ReactNode): void {
   showModalEvent.emit(modal);
}

export function hideModal(): void {
   hideModalEvent.emit();
}

export function hasOpenModal(): boolean {
   return _hasOpenModal;
}

let _hasOpenModal = false;

export function GlobalModal(): React.ReactNode {
   const [content, setContent] = useState<ReactNode>(null);

   useTypedEvent(showModalEvent, (e) => {
      _hasOpenModal = true;
      setContent(e);
   });

   useTypedEvent(hideModalEvent, () => {
      _hasOpenModal = false;
      setContent(null);
   });

   if (!content) {
      return null;
   }

   return (
      <div id="global-modal" className="overlay">
         {content}
      </div>
   );
}

const showToastEvent = new TypedEvent<{ timeout: number; content: string; className?: string }>();
const hideToastEvent = new TypedEvent<void>();

export function showToast(content: string, timeout = 5000, className?: string): void {
   showToastEvent.emit({ content, timeout, className });
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
   const [className, setClassName] = useState<string | undefined>(undefined);

   useTypedEvent(showToastEvent, (e) => {
      setContent(e.content);
      setClassName(e.className);
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

   return (
      <div id="global-toast">
         <div className={cls("toast", className)}>
            <div className="ml5">{html(content)}</div>
            <div className="m-icon small pointer" onClick={hideToast}>
               close
            </div>
         </div>
      </div>
   );
}
