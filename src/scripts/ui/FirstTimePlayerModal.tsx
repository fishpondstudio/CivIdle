import { useState } from "react";
import install from "../../images/install.png";
import { useUser } from "../rpc/RPCClient";
import { CountryCode, getCountryName, getFlagUrl } from "../utilities/CountryCode";
import { jsxMapOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { ChangeModernUIComponent } from "./ChangeModernUIComponent";
import { ChangeSoundComponent } from "./ChangeSoundComponent";
import { hideModal } from "./GlobalModal";

enum SetupStep {
   Welcome = 0,
   Tutorial1 = 1,
   Tutorial2 = 2,
   Tutorial3 = 3,
   Settings = 4,
}

export function FirstTimePlayerModal(): React.ReactNode {
   const [step, setStep] = useState(SetupStep.Welcome);
   const [skipTutorial, setSkipTutorial] = useState(false);
   const user = useUser();
   if (!user) {
      return null;
   }
   const [handle, setHandle] = useState(user.handle);
   const [flag, setFlag] = useState(user.flag);
   const name = getCountryName(flag);
   const content = () => {
      switch (step) {
         case SetupStep.Welcome:
            return (
               <div className="row">
                  <div style={{ alignSelf: "flex-start" }}>
                     <img src={install} style={{ width: "48px" }} />
                  </div>
                  <div className="f1" style={{ margin: "10px 15px" }}>
                     <div>Welcome to CivIdle Setup.</div>
                     <div className="sep10" />
                     <div>
                        In this game, you will run your own empire: manage productions, unlock technologies,
                        trade resources with other players, create great people and build world wonders.
                     </div>
                     <div className="sep10" />
                     <div>
                        Drag your mouse to move around. Use scroll wheel to zoom in or out. Click an empty
                        tile to build new buildings, click a building to inspect.
                     </div>
                     <div className="sep20" />
                     <div className="row pointer" onClick={() => setSkipTutorial(false)}>
                        <div className="m-icon small mr10">
                           {skipTutorial ? "radio_button_unchecked" : "radio_button_checked"}
                        </div>
                        <div>I haven't played similar games and I'd like to go through a quick tutorial</div>
                     </div>
                     <div className="sep15" />
                     <div className="row pointer" onClick={() => setSkipTutorial(true)}>
                        <div className="m-icon small mr10">
                           {skipTutorial ? "radio_button_checked" : "radio_button_unchecked"}
                        </div>
                        <div>
                           I have played Industry Idle and I know the drill, please skip the basic tutorial
                        </div>
                     </div>
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
                     <div>
                        Buildings are the basic building block of your empire - place them on the explored map
                        tiles. Certain buildings like Stone Quarries and Aqueducts that extract deposit need
                        to be placed on a deposit tile. A building will lift the fog of its surrounding tiles.
                     </div>
                     <div className="sep10" />
                     <div>
                        Buildings consume resources and produce new ones. They will <b>automatically</b>{" "}
                        transport needed resources. The produced resources will be stored in the buildings
                        which can be transported into other buildings that need these resources. Buildings
                        storage space is limited.
                     </div>
                     <div className="sep10" />
                     <div>
                        Buildings need <b>workers</b> for transportation and production - you need to build
                        residential buildings like <b>huts</b> to increase the worker population.
                     </div>
                     <div className="sep10" />
                     <div>You can upgrade a building to increase its production and storage.</div>
                  </div>
               </div>
            );
         case SetupStep.Tutorial2:
            return (
               <div className="row">
                  <div style={{ alignSelf: "flex-start" }}>
                     <img src={install} style={{ width: "48px" }} />
                  </div>
                  <div className="f1" style={{ margin: "10px 15px" }}>
                     <div>
                        <b>Science</b> is used to unlock technologies in the tech tree. A technology unlocks
                        new building, wonders and boosts.
                     </div>
                     <div className="sep10" />
                     <div>
                        <b>Busy workers</b> generate a small amount of science. Later on, you will unlock
                        buildings like libraries and schools that produce science.
                     </div>
                     <div className="sep10" />
                     <div>
                        The amount of workers available is affected by <b>happiness</b>. Each building will
                        cost 1 happiness. And you gain happiness from technologies, wonders and great people.
                        Make sure your workers are happy, otherwise your empire's production will halt.
                     </div>
                     <div className="sep10" />
                     <div>
                        <b>Wonders</b> are one of a kind building - you can only build one and they cannot be
                        removed once built. Wonders can provide significant boost or unlock new mechanisms.
                     </div>
                  </div>
               </div>
            );
         case SetupStep.Tutorial3:
            return (
               <div className="row">
                  <div style={{ alignSelf: "flex-start" }}>
                     <img src={install} style={{ width: "48px" }} />
                  </div>
                  <div className="f1" style={{ margin: "10px 15px" }}>
                     <div>
                        When you enter a new age, a new <b>great person</b> will be born. You can choose one
                        out of three candidates. Great people provide boosts and will be added to your
                        permanent collection.
                     </div>
                     <div className="sep10" />
                     <div>
                        When you reborn, you collect all the great people you've chosen this run, plus some
                        extra great people based on your <b>total empire value</b>. While your empire will be
                        gone, these permanent great people will remain with you.
                     </div>
                     <div className="sep10" />
                     <div>
                        <b>Permanent</b> great people can be upgraded by collecting great people from each
                        run. They will help your empire achieve new heights.
                     </div>
                     <div className="sep10" />
                     <div>
                        That's all the basics you need to know. If you have questions, the best way to get
                        help is by asking the <b>chat</b> - we have a friendly community that is always ready
                        to help.
                     </div>
                  </div>
               </div>
            );
         case SetupStep.Settings:
            return (
               <div className="row">
                  <div style={{ alignSelf: "flex-start" }}>
                     <img src={install} style={{ width: "48px" }} />
                  </div>
                  <div className="f1" style={{ margin: "10px 15px" }}>
                     <div>Choose your player handle</div>
                     <div className="sep5" />
                     <div className="row">
                        <div className="f1">
                           <input
                              value={handle}
                              onChange={(e) => setHandle(e.target.value)}
                              type="text"
                              className="w100"
                           />
                        </div>
                        <div>
                           <img
                              className="ml5"
                              src={getFlagUrl(flag)}
                              style={{ height: "30px", display: "block" }}
                              title={name}
                              alt={name}
                           />
                        </div>
                     </div>
                     <div className="sep5" />
                     <div className="text-small text-desc">{t(L.ChangePlayerHandledDesc)}</div>
                     <div className="sep10" />
                     <div>Choose your player flag</div>
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
               </div>
            );
      }
   };

   return (
      <div className="window" style={{ width: "500px" }}>
         <div className="title-bar">
            <div className="title-bar-text">CivIdle Setup</div>
         </div>
         <div className="window-body" style={{ height: "350px", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: "1" }}>{content()}</div>
            <div>
               <div className="row" style={{ justifyContent: "flex-end" }}>
                  <button
                     style={{ width: "80px" }}
                     onClick={() => {
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
                              hideModal();
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
