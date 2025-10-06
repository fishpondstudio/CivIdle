import { L, t } from "../../../shared/utilities/i18n";
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
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{title}</div>
         </div>
         <div className="window-body" style={{ padding: "5px 10px" }}>
            {children}
            <div className="row" style={{ margin: "20px 0 0 0", justifyContent: "center" }}>
               <button
                  style={{ width: "80px", fontWeight: "bold" }}
                  onClick={() => {
                     playClick();
                     onConfirm();
                     hideModalFunc();
                  }}
               >
                  {t(L.ConfirmYes)}
               </button>
               <div style={{ width: "10px" }}></div>
               <button
                  style={{ width: "80px" }}
                  onClick={() => {
                     playClick();
                     hideModalFunc();
                  }}
               >
                  {t(L.ConfirmNo)}
               </button>
            </div>
         </div>
      </div>
   );
}
