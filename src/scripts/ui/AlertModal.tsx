import { $t, L } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";

export function AlertModal({
   title,
   children,
}: React.PropsWithChildren & { title: string }): React.ReactNode {
   return (
      <div className="window modal-window">
         <div className="title-bar">
            <div className="title-bar-text">{title}</div>
         </div>
         <div className="window-body" style={{ padding: "0.5rem 1rem" }}>
            {children}
            <div className="row modal-actions" style={{ margin: "2rem 0 0 0", justifyContent: "center" }}>
               <button
                  style={{ minWidth: "8rem" }}
                  onClick={() => {
                     playClick();
                     hideModal();
                  }}
               >
                  {$t(L.Ok)}
               </button>
            </div>
         </div>
      </div>
   );
}
