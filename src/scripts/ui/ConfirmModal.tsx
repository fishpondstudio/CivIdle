import { $t, L } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";

export function ConfirmModal({
   title,
   children,
   onConfirm,
   hideModalFunc = hideModal,
}: React.PropsWithChildren & {
   title: string;
   onConfirm: () => void;
   hideModalFunc?: () => void;
}): React.ReactNode {
   return (
      <div className="window modal-window">
         <div className="title-bar">
            <div className="title-bar-text">{title}</div>
         </div>
         <div className="window-body">
            {children}
            <div className="row mt15 jcc modal-actions">
               <button
                  style={{ minWidth: "8rem", fontWeight: "bold" }}
                  onClick={() => {
                     playClick();
                     onConfirm();
                     hideModalFunc();
                  }}
               >
                  {$t(L.ConfirmYes)}
               </button>
               <button
                  style={{ minWidth: "8rem" }}
                  onClick={() => {
                     playClick();
                     hideModalFunc();
                  }}
               >
                  {$t(L.ConfirmNo)}
               </button>
            </div>
         </div>
      </div>
   );
}
