import { L, t } from "../../../shared/utilities/i18n";
import { client } from "../rpc/RPCClient";
import { playError } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";

export function ConnectToDeviceModal(): React.ReactNode {
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.ConnectToADevice)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <form
               method="post"
               onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  try {
                     await client.verifyPassCode(
                        String(formData.get("handle") ?? ""),
                        String(formData.get("passcode") ?? ""),
                     );
                     window.location.reload();
                  } catch (error) {
                     playError();
                     showToast(String(error));
                  }
               }}
            >
               <div>{t(L.PlayerHandle)}</div>
               <input type="text" name="handle" className="w100 mt5 mb10" />
               <div>{t(L.Passcode)}</div>
               <input type="text" name="passcode" className="w100 mt5 mb10" />
               <div className="row">
                  <div className="f1"></div>
                  <button type="submit" className="text-strong">
                     {t(L.CrossPlatformConnect)}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
