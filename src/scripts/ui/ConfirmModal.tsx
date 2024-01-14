import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";

export function ConfirmModal({
   title,
   content,
   onConfirm,
}: { title: string; content: string; onConfirm: () => void }): React.ReactNode {
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{title}</div>
         </div>
         <div className="window-body">
            {content}
            <div className="row" style={{ margin: "20px 0 0 0", justifyContent: "center" }}>
               <button
                  style={{ width: "80px", fontWeight: "bold" }}
                  onClick={() => {
                     playClick();
                     onConfirm();
                     hideModal();
                  }}
               >
                  {t(L.ConfirmYes)}
               </button>
               <div style={{ width: "10px" }}></div>
               <button
                  style={{ width: "80px" }}
                  onClick={() => {
                     playClick();
                     hideModal();
                  }}
               >
                  {t(L.ConfirmNo)}
               </button>
            </div>
         </div>
      </div>
   );
}
