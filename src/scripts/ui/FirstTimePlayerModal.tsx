import { useState } from "react";
import { GameOptionsChanged } from "../../../shared/logic/GameStateLogic";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { L, t } from "../../../shared/utilities/i18n";
import "../../css/Tutorial.css";
import { ToggleChatWindow } from "../Global";
import { OnUserChanged, client, useUser } from "../rpc/RPCClient";
import { CountryCode, getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { jsxMapOf } from "../utilities/Helper";
import { refreshOnTypedEvent, useTypedEvent } from "../utilities/Hook";
import { playClick, playError } from "../visuals/Sound";
import { AdvisorContentComponent } from "./AdvisorModal";
import { ChangeModernUIComponent } from "./ChangeModernUIComponent";
import { ChangeSoundComponent } from "./ChangeSoundComponent";
import { hideModal, showToast } from "./GlobalModal";

enum SetupStep {
   Step1 = 0,
   Step2 = 1,
   Step3 = 2,
}

export function FirstTimePlayerModal(): React.ReactNode {
   refreshOnTypedEvent(GameOptionsChanged);
   const [step, setStep] = useState(SetupStep.Step1);
   let content: React.ReactNode = null;
   switch (step) {
      case SetupStep.Step1: {
         content = (
            <AdvisorContentComponent
               advisor="Welcome1"
               action={
                  <div className="row">
                     <div className="f1"></div>
                     <button
                        className="text-strong"
                        onClick={() => {
                           setStep(step + 1);
                           playClick();
                        }}
                     >
                        {t(L.FirstTimeGuideNext)}
                     </button>
                  </div>
               }
            />
         );
         break;
      }
      case SetupStep.Step2: {
         content = (
            <AdvisorContentComponent
               advisor="Welcome2"
               action={
                  <div className="row">
                     <div className="f1"></div>
                     <button
                        className="text-strong"
                        onClick={() => {
                           setStep(step + 1);
                           playClick();
                        }}
                     >
                        {t(L.FirstTimeGuideNext)}
                     </button>
                  </div>
               }
            />
         );
         break;
      }
      case SetupStep.Step3: {
         ToggleChatWindow.emit(true);
         const submitEvent = new TypedEvent<void>();
         content = (
            <AdvisorContentComponent
               advisor="Welcome3"
               content={<FirstTimePlayerSettings submitEvent={submitEvent} />}
               action={
                  <div className="row">
                     <div className="f1"></div>
                     <button onClick={() => submitEvent.emit()} style={{ width: 80 }}>
                        {t(L.Ok)}
                     </button>
                  </div>
               }
            />
         );
         break;
      }
   }

   return (
      <div className="window" style={{ width: 800, maxWidth: "80vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.FirstTimeTutorialWelcome)}</div>
         </div>
         {content}
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
      } finally {
         hideModal();
      }
   });
   return (
      <div className="mt10">
         <div className="text-strong">{t(L.TutorialPlayerHandle)}</div>
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
               <img
                  className="ml5"
                  src={getFlagUrl(flag)}
                  style={{ height: "30px", display: "block" }}
                  title={countryName}
                  alt={countryName}
               />
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
                     <img
                        key={c}
                        onClick={async () => {
                           if (!user) {
                              playError();
                              showToast(t(L.OfflineErrorMessage));
                              return;
                           }
                           setFlag(c);
                        }}
                        src={getFlagUrl(c)}
                        className="pointer player-flag-large"
                        title={v}
                        alt={v}
                     />
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
