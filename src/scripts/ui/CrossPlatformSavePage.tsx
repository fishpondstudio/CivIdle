import { useState } from "react";
import { CROSS_PLATFORM_SAVE_URL } from "../../../shared/logic/Constants";
import { Platform, UserAttributes } from "../../../shared/utilities/Database";
import { getPlatform } from "../../../shared/utilities/DatabaseShared";
import { hasFlag, isNullOrUndefined } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import "../../css/CrossPlatformSavePage.css";
import { compressSave, decompressSave, overwriteSaveGame, saveGame } from "../Global";
import { client, usePlatformInfo, useUser } from "../rpc/RPCClient";
import { isSteam } from "../rpc/SteamClient";
import { openUrl } from "../utilities/Platform";
import { playClick, playError, playSuccess } from "../visuals/Sound";
import { ConnectToDeviceModal } from "./ConnectToDeviceModal";
import { showModal, showToast } from "./GlobalModal";
import { html, RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { TitleBarComponent } from "./TitleBarComponent";
import { WarningComponent } from "./WarningComponent";

let loadingState = false;

export function CrossPlatformSavePage(): React.ReactNode {
   const info = usePlatformInfo();
   const user = useUser();
   const isConnected = !isNullOrUndefined(info?.connectedUserId);
   const [loading, setLoading] = useState(loadingState);
   return (
      <div className="cloud-save-page">
         <div className="window">
            <TitleBarComponent>{t(L.CrossPlatformSave)}</TitleBarComponent>
            <div className="window-body">
               {isSteam() && user && !hasFlag(user.attr, UserAttributes.DLC2) ? (
                  <WarningComponent
                     icon="info"
                     className="mb10 text-small pointer"
                     onClick={() => {
                        playClick();
                        openUrl(CROSS_PLATFORM_SAVE_URL);
                     }}
                  >
                     {html(t(L.CrossPlatformSaveDescHTML))}
                  </WarningComponent>
               ) : null}
               <fieldset>
                  <legend>{t(L.CrossPlatformAccount)}</legend>
                  <div className="row mv5">
                     <div className="f1">{t(L.CurrentPlatform)}</div>
                     <div className="text-strong">{getPlatformName(getPlatform(info?.originalUserId))}</div>
                  </div>
                  <div className="row mv5">
                     <div className="f1">{t(L.OtherPlatform)}</div>
                     <div className="text-strong">{getPlatformName(getPlatform(info?.connectedUserId))}</div>
                  </div>
                  {isConnected ? null : (
                     <>
                        <div className="separator"></div>
                        <div className="row mv5">
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
                  )}
               </fieldset>
               <fieldset>
                  <legend>{t(L.CrossPlatformSave)}</legend>
                  <div className="row mv5">
                     <div className="f1">{t(L.CrossPlatformSaveStatus)}</div>
                     <div className="text-strong">
                        {isConnected ? (
                           user?.saveOwner ? (
                              <TextWithHelp
                                 content={
                                    user.saveOwner === info.originalUserId
                                       ? null
                                       : t(L.CrossPlatformSaveStatusCheckedOutTooltip)
                                 }
                                 className="text-red"
                              >
                                 {t(L.CrossPlatformSaveStatusCheckedOut, {
                                    platform: getPlatformName(getPlatform(user?.saveOwner)),
                                 })}
                              </TextWithHelp>
                           ) : (
                              <span className="text-green">{t(L.CrossPlatformSaveStatusCheckedIn)}</span>
                           )
                        ) : null}
                     </div>
                  </div>
                  {(user?.lastCheckInAt ?? 0) > 0 ? (
                     <div className="row mv5">
                        <div className="text-strong f1">{t(L.CrossPlatformSaveLastCheckIn)}</div>
                        <div>{new Date(user?.lastCheckInAt ?? 0).toLocaleString()}</div>
                     </div>
                  ) : null}
               </fieldset>
               <div className="row">
                  <button
                     className="f1"
                     onClick={() => {
                        window.location.reload();
                     }}
                  >
                     {t(L.CloudSaveRefresh)}
                  </button>
                  <div className="mr5"></div>
                  <button
                     disabled={isConnected && user?.saveOwner !== info.originalUserId}
                     style={{ flex: "2" }}
                     onClick={() => {
                        window.location.search = "";
                     }}
                  >
                     {t(L.CloudSaveReturnToGame)}
                  </button>
                  <div className="mr5"></div>
                  {user && info && user.saveOwner === info.originalUserId ? (
                     <button
                        disabled={loading}
                        className="text-strong"
                        style={{ flex: "2" }}
                        onClick={async () => {
                           if (loadingState) {
                              playError();
                              return;
                           }
                           try {
                              playClick();
                              loadingState = true;
                              setLoading(loadingState);
                              await client.checkInSave(await compressSave());
                              window.location.search = "";
                           } catch (error) {
                              playError();
                              showToast(String(error));
                              loadingState = false;
                              setLoading(loadingState);
                           }
                        }}
                     >
                        {t(L.CheckInCloudSave)}
                     </button>
                  ) : (
                     <button
                        disabled={
                           !user || !info || !isNullOrUndefined(user.saveOwner) || !isConnected || loading
                        }
                        className="text-strong f1"
                        style={{ flex: "2" }}
                        onClick={async () => {
                           if (loadingState) {
                              playError();
                              return;
                           }
                           try {
                              playClick();
                              loadingState = true;
                              setLoading(loadingState);
                              const buffer = await client.checkOutSaveStart();
                              if (buffer.length <= 0) {
                                 throw new Error("Your cloud save is corrupted");
                              }
                              const save = await decompressSave(buffer);
                              overwriteSaveGame(save);
                              await saveGame();
                              await client.checkOutSaveEnd();
                              window.location.search = "";
                           } catch (error) {
                              playError();
                              console.error(error);
                              showToast(String(error));
                              loadingState = false;
                              setLoading(loadingState);
                           }
                        }}
                     >
                        {t(L.CheckOutCloudSave)}
                     </button>
                  )}
               </div>
            </div>
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
