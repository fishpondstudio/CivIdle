import { useEffect, useState } from "react";
import { getPlatform } from "../../../server/src/DatabaseHelper";
import { Platform, type ICrossPlatformResult } from "../../../shared/utilities/Database";
import { L, t } from "../../../shared/utilities/i18n";
import "../../css/CrossPlatformSavePage.css";
import { compressSave, writeBytes } from "../Global";
import { client, useUser } from "../rpc/RPCClient";
import { playClick, playError, playSuccess } from "../visuals/Sound";
import { hideModal, showModal, showToast } from "./GlobalModal";
import { RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";

export function CrossPlatformSavePage(): React.ReactNode {
   const [result, setResult] = useState<ICrossPlatformResult>();
   const user = useUser();

   useEffect(() => {
      client.getCrossPlatformSave().then((result) => {
         setResult(result);
      });
   }, []);

   return (
      <div className="cloud-save-page">
         <div className="window">
            <div className="title-bar">
               <div className="title-bar-text">{t(L.CrossPlatformSave)}</div>
            </div>
            <div className="window-body">
               <fieldset>
                  <legend>{t(L.CrossPlatformAccount)}</legend>
                  <div className="row mb5">
                     <div className="f1">{t(L.CurrentPlatform)}</div>
                     <div className="text-strong">{getPlatformName(result?.currentPlatform)}</div>
                  </div>
                  <div className="row">
                     <div className="f1">{t(L.OtherPlatform)}</div>
                     <div className="text-strong">{getPlatformName(result?.otherPlatform)}</div>
                  </div>
                  {result && !result.connected ? (
                     <>
                        <div className="separator"></div>
                        <div className="row mb5">
                           <div className="f1">{t(L.PlayerHandle)}</div>
                           <div className="text-strong">{user?.handle}</div>
                        </div>
                        <RenderHTML
                           html={t(L.PlatformSyncInstructionHTML)}
                           className="mb10 text-desc text-small"
                        />
                        <div className="row">
                           <button
                              className="f1"
                              onClick={async () => {
                                 try {
                                    const code = await client.requestPassCode();
                                    playSuccess();
                                    showToast(t(L.PasscodeToastHTML, { code }), 10_000);
                                 } catch (error) {
                                    playError();
                                    showToast(String(error));
                                 }
                              }}
                           >
                              {t(L.SyncToANewDevice)}
                           </button>
                           <div className="mr10"></div>
                           <button
                              className="f1"
                              onClick={() => {
                                 playClick();
                                 showModal(<ConnectToDeviceModal />);
                              }}
                           >
                              {t(L.ConnectToADevice)}
                           </button>
                        </div>
                     </>
                  ) : null}
               </fieldset>
               <fieldset>
                  <legend>{t(L.CrossPlatformSave)}</legend>
                  <div className="row mb5">
                     <div className="f1">{t(L.CrossPlatformSaveStatus)}</div>
                     <div className="text-strong">
                        {result?.connected ? (
                           result?.saveOwner ? (
                              <TextWithHelp
                                 content={
                                    result.saveOwner === result.originalUserId
                                       ? null
                                       : t(L.CrossPlatformSaveStatusCheckedOutTooltip)
                                 }
                              >
                                 {t(L.CrossPlatformSaveStatusCheckedOut, {
                                    platform: getPlatformName(getPlatform(result?.saveOwner)),
                                 })}
                              </TextWithHelp>
                           ) : (
                              t(L.CrossPlatformSaveStatusCheckedIn)
                           )
                        ) : null}
                     </div>
                  </div>
                  {result && result.lastCheckInAt > 0 ? (
                     <div className="row mb5">
                        <div className="text-strong f1">{t(L.CrossPlatformSaveLastCheckIn)}</div>
                        <div>{new Date(result?.lastCheckInAt).toLocaleString()}</div>
                     </div>
                  ) : null}
                  <div className="row mt10">
                     <button
                        className="w100"
                        onClick={() => {
                           window.location.reload();
                        }}
                     >
                        {t(L.CloudSaveRefresh)}
                     </button>
                     <div className="mr10"></div>
                     {result && result.saveOwner === result.originalUserId ? (
                        <button
                           className="text-strong w100"
                           onClick={async () => {
                              try {
                                 await client.checkInSave(await compressSave());
                                 window.location.search = "";
                              } catch (error) {
                                 playError();
                                 showToast(String(error));
                              }
                           }}
                        >
                           {t(L.CheckInCloudSave)}
                        </button>
                     ) : (
                        <button
                           disabled={!result || !!result.saveOwner || !result.connected}
                           className="text-strong w100"
                           onClick={async () => {
                              try {
                                 const buffer = await client.checkOutSave();
                                 if (buffer.length > 0) {
                                    writeBytes(buffer);
                                 }
                                 window.location.search = "";
                              } catch (error) {
                                 playError();
                                 showToast(String(error));
                              }
                           }}
                        >
                           {t(L.CheckOutCloudSave)}
                        </button>
                     )}
                  </div>
               </fieldset>
            </div>
         </div>
      </div>
   );
}

function ConnectToDeviceModal(): React.ReactNode {
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

function getPlatformName(platform: Platform | null | undefined): string {
   switch (platform) {
      case Platform.Android:
         return t(L.PlatformAndroid);
      case Platform.iOS:
         return t(L.PlatformiOS);
      case Platform.Steam:
         return t(L.PlatformSteam);
      default:
         return "";
   }
}
