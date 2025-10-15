import Tippy from "@tippyjs/react";
import { useState } from "react";
import { GameOptionsChanged } from "../../../shared/logic/GameStateLogic";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { L, t } from "../../../shared/utilities/i18n";
import "../../css/Tutorial.css";
import TitleImage from "../../images/TitleImage.png";
import { OnUserChanged, client, useUser } from "../rpc/RPCClient";
import { CountryCode, getCountryName } from "../utilities/CountryCode";
import { jsxMapOf } from "../utilities/Helper";
import { refreshOnTypedEvent, useTypedEvent } from "../utilities/Hook";
import { playClick, playError } from "../visuals/Sound";
import { ChangeModernUIComponent } from "./ChangeModernUIComponent";
import { ChangeSoundComponent } from "./ChangeSoundComponent";
import { showModal, showToast } from "./GlobalModal";
import { LanguageSelect } from "./LanguageSelectComponent";
import { html } from "./RenderHTMLComponent";
import { PlayerFlagComponent } from "./TextureSprites";
import { TutorialModal } from "./TutorialModal";
import { WarningComponent } from "./WarningComponent";

const SubmitEvent = new TypedEvent<void>();

export function FirstTimePlayerModal(): React.ReactNode {
   refreshOnTypedEvent(GameOptionsChanged);
   return (
      <div className="window" style={{ width: "600px", maxWidth: "50vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.FirstTimeTutorialWelcome)}</div>
         </div>
         <div className="window-body">
            <img src={TitleImage} className="w100" />
            <div className="row mt10">
               <div className="m-icon mr10">translate</div>
               <LanguageSelect className="f1" setChat />
            </div>
            <div className="sep10" />
            <div className="row">
               <div className="f1" />
               <button onClick={() => showModal(<FirstTimePlayerSettingsModal />)}>
                  {t(L.FirstTimeGuideNext)}
               </button>
            </div>
         </div>
      </div>
   );
}
export function FirstTimePlayerSettingsModal(): React.ReactNode {
   refreshOnTypedEvent(GameOptionsChanged);
   return (
      <div className="window" style={{ width: "600px", maxWidth: "50vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.FirstTimeTutorialWelcome)}</div>
         </div>
         <div className="window-body" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <WarningComponent icon="info">{html(t(L.FirstTimeGuideIntroHTML))}</WarningComponent>
            <div className="sep5" />
            <FirstTimePlayerSettings submitEvent={SubmitEvent} />
            <div className="sep10" />
            <div className="row">
               <div className="f1" />
               <button
                  onClick={() => {
                     SubmitEvent.emit();
                     showModal(<TutorialModal />);
                  }}
               >
                  {t(L.FirstTimeGuideNext)}
               </button>
            </div>
         </div>
      </div>
   );
}

function FirstTimePlayerSettings({ submitEvent }: { submitEvent: TypedEvent<void> }): React.ReactNode {
   const user = useUser();
   const [handle, setHandle] = useState(user?.handle ?? "");
   const [flag, setFlag] = useState(user?.flag ?? CountryCode.EARTH);
   const countryName = getCountryName(flag);
   useTypedEvent(submitEvent, async () => {
      try {
         if (user) {
            playClick();
            await client.changeHandle(handle, flag);
            user.handle = handle;
            user.flag = flag;
            OnUserChanged.emit({ ...user });
         } else {
            playError();
            showToast(t(L.OfflineErrorMessage));
         }
      } catch (error) {
         playError();
         showToast(String(error));
      }
   });
   return (
      <div>
         <div className="text-strong">{t(L.TutorialPlayerHandle)}</div>
         <div className="sep5" />
         <div className="row">
            <div className="f1">
               <input
                  value={handle}
                  onChange={async (e) => {
                     if (user) {
                        setHandle(e.target.value);
                     } else {
                        showToast(t(L.OfflineErrorMessage));
                     }
                  }}
                  type="text"
                  className="w100"
               />
            </div>
            <div>
               <Tippy content={countryName}>
                  <PlayerFlagComponent name={flag} style={{ marginLeft: 5 }} />
               </Tippy>
            </div>
         </div>
         <div className="sep5" />
         <div className="text-small text-desc">{t(L.ChangePlayerHandledDesc)}</div>
         <div className="sep10" />
         <div className="text-strong">{t(L.TutorialPlayerFlag)}</div>
         <div className="sep5" />
         <div className="inset-deep-2 white" style={{ padding: "10px", height: "100px", overflowY: "auto" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
               {jsxMapOf(CountryCode, (c, v) => {
                  return (
                     <Tippy key={c} content={v}>
                        <div
                           className="pointer"
                           onClick={async () => {
                              if (!user) {
                                 playError();
                                 showToast(t(L.OfflineErrorMessage));
                                 return;
                              }
                              setFlag(c);
                           }}
                        >
                           <PlayerFlagComponent name={c} />
                        </div>
                     </Tippy>
                  );
               })}
            </div>
         </div>
         <div className="sep15" />
         <ChangeModernUIComponent />
         <ChangeSoundComponent />
      </div>
   );
}
