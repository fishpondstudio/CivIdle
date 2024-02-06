import { useState } from "react";
import { GameOptionsChanged } from "../../../shared/logic/GameStateLogic";
import { firstKeyOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import install from "../../images/install.png";
import { OnUserChanged, client, useUser } from "../rpc/RPCClient";
import { CountryCode, getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { jsxMapOf } from "../utilities/Helper";
import { refreshOnTypedEvent } from "../utilities/Hook";
import { playError } from "../visuals/Sound";
import { ChangeModernUIComponent } from "./ChangeModernUIComponent";
import { ChangeSoundComponent } from "./ChangeSoundComponent";
import { hideModal, showToast } from "./GlobalModal";
import { LanguageSelect } from "./LanguageSelectComponent";
import { RenderHTML } from "./RenderHTMLComponent";

enum SetupStep {
   Welcome = 0,
   Tutorial1 = 1,
   Tutorial2 = 2,
   Tutorial3 = 3,
   Settings = 4,
}

export function FirstTimePlayerModal(): React.ReactNode {
   refreshOnTypedEvent(GameOptionsChanged);
   const [step, setStep] = useState(SetupStep.Welcome);
   const [skipTutorial, setSkipTutorial] = useState(false);
   const user = useUser();
   const edit = { handle: user?.handle ?? "", flag: user?.flag ?? firstKeyOf(CountryCode)! };
   const content = () => {
      switch (step) {
         case SetupStep.Welcome:
            return (
               <div className="row">
                  <div style={{ alignSelf: "flex-start" }}>
                     <img src={install} style={{ width: "48px" }} />
                  </div>
                  <div className="f1" style={{ margin: "10px 15px" }}>
                     <div className="row mb15">
                        <div className="m-icon mr5 text-desc">translate</div>
                        <LanguageSelect className="f1" />
                     </div>
                     <RenderHTML html={t(L.Tutorial1)} />
                     <div className="row pointer" onClick={() => setSkipTutorial(false)}>
                        <div className="m-icon small mr10">
                           {skipTutorial ? "radio_button_unchecked" : "radio_button_checked"}
                        </div>
                        <div>{t(L.Tutorial2)}</div>
                     </div>
                     <div className="sep15" />
                     <div className="row pointer" onClick={() => setSkipTutorial(true)}>
                        <div className="m-icon small mr10">
                           {skipTutorial ? "radio_button_checked" : "radio_button_unchecked"}
                        </div>
                        <div>{t(L.Tutorial3)}</div>
                     </div>
                     <div className="sep15" />
                  </div>
               </div>
            );
         case SetupStep.Tutorial1:
            return (
               <div className="row">
                  <div style={{ alignSelf: "flex-start" }}>
                     <img src={install} style={{ width: "48px" }} />
                  </div>
                  <div className="f1" style={{ margin: "10px 15px" }}>
                     <RenderHTML html={t(L.Tutorial4)} />
                  </div>
               </div>
            );
         case SetupStep.Tutorial2:
         case SetupStep.Tutorial3:
            return (
               <div className="row">
                  <div style={{ alignSelf: "flex-start" }}>
                     <img src={install} style={{ width: "48px" }} />
                  </div>
                  <div className="f1" style={{ margin: "10px 15px" }}>
                     <RenderHTML html={t(L.Tutorial6)} />
                  </div>
               </div>
            );
         case SetupStep.Settings:
            return <FirstTimePlayerSettings user={edit} />;
      }
   };

   return (
      <div className="window" style={{ width: "500px" }}>
         <div className="title-bar">
            <div className="title-bar-text">CivIdle Setup</div>
         </div>
         <div
            className="window-body"
            style={{ minHeight: "350px", display: "flex", flexDirection: "column" }}
         >
            <div style={{ flex: "1" }}>{content()}</div>
            <div>
               <div className="row" style={{ justifyContent: "flex-end" }}>
                  <button
                     style={{ width: "80px" }}
                     onClick={async () => {
                        switch (step) {
                           case SetupStep.Welcome: {
                              if (skipTutorial) {
                                 setStep(SetupStep.Settings);
                              } else {
                                 setStep(SetupStep.Tutorial1);
                              }
                              break;
                           }
                           case SetupStep.Settings: {
                              try {
                                 if (!user) {
                                    throw new Error(t(L.OfflineErrorMessage));
                                 }
                                 await client.changeHandle(edit.handle, edit.flag);
                                 user.handle = edit.handle;
                                 user.flag = edit.flag;
                                 OnUserChanged.emit({ ...user });
                              } catch (error) {
                                 playError();
                                 showToast(String(error));
                              } finally {
                                 hideModal();
                              }
                              break;
                           }
                           default: {
                              setStep(step + 1);
                              break;
                           }
                        }
                     }}
                  >
                     {step === SetupStep.Settings ? t(L.FirstTimeGuideFinish) : t(L.FirstTimeGuideNext)}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

function FirstTimePlayerSettings({ user }: { user: { handle: string; flag: string } }): React.ReactNode {
   const [handle, setHandle] = useState(user.handle);
   const [flag, setFlag] = useState(user.flag);
   const countryName = getCountryName(flag);
   return (
      <div className="row">
         <div style={{ alignSelf: "flex-start" }}>
            <img src={install} style={{ width: "48px" }} />
         </div>
         <div className="f1" style={{ margin: "10px 15px" }}>
            <div>{t(L.TutorialPlayerHandle)}</div>
            <div className="sep5" />
            <div className="row">
               <div className="f1">
                  <input
                     value={handle}
                     onChange={(e) => {
                        if (user) {
                           user.handle = e.target.value;
                           setHandle(user.handle);
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
            <div>{t(L.TutorialPlayerFlag)}</div>
            <div className="sep5" />
            <div
               className="inset-deep-2 white"
               style={{ padding: "10px", height: "100px", overflowY: "auto" }}
            >
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
                              user.flag = c;
                              setFlag(user.flag);
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
      </div>
   );
}
