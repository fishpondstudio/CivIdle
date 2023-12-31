import { Singleton } from "../utilities/Singleton";
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
                  style={{ width: "80px" }}
                  onClick={() => {
                     playClick();
                     hideModal();
                  }}
               >
                  {t(L.ConfirmNo)}
               </button>
               <div style={{ width: "10px" }}></div>
               <button
                  style={{ width: "80px" }}
                  onClick={() => {
                     playClick();
                     onConfirm();
                     hideModal();
                  }}
               >
                  {t(L.ConfirmYes)}
               </button>
            </div>
         </div>
      </div>
   );
}

function getWebglRenderInfo(): string {
   const { app } = Singleton().sceneManager.getContext();
   const gl = app.view.getContext("webgl2");
   if (!gl) {
      return "";
   }
   const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
   if (!debugInfo) {
      return "";
   }
   // const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
   const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
   return renderer;
}
