import classNames from "classnames";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { notifyGameOptionsUpdate, syncUITheme, useGameOptions } from "../Global";
import { Tick } from "../logic/TickLogic";
import { PlayerMapScene } from "../scenes/PlayerMapScene";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { sizeOf } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { Singleton } from "../utilities/Singleton";
import { AboutModal } from "./AboutModal";
import { showModal } from "./GlobalModal";

type MenuItemOptions = "view" | "options" | "help" | null;

function MenuButton({ name }: { name: string }) {
   return (
      <>
         <span className="menu-hotkey">{name.substring(0, 1)}</span>
         {name.substring(1)}
      </>
   );
}

function MenuItem({ check, children }: PropsWithChildren<{ check: boolean }>) {
   return (
      <>
         <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            style={{
               fill: "currentcolor",
               display: "inline-block",
               verticalAlign: "middle",
               visibility: check ? "visible" : "hidden",
               marginRight: "2px",
               marginLeft: "2px",
            }}
         >
            <path d="M5 7v3l2 2 5-5V4L7 9Z"></path>
         </svg>
         {children}
      </>
   );
}

export function MenuComponent() {
   const [active, setActive] = useState<MenuItemOptions>(null);
   const buttonRef = useRef(null);
   useEffect(() => {
      function onPointerDown(e: PointerEvent) {
         setActive(null);
      }
      window.addEventListener("pointerdown", onPointerDown);
      return () => {
         window.removeEventListener("pointerdown", onPointerDown);
      };
   }, []);
   const gameOptions = useGameOptions();

   return (
      <>
         <div className="menus">
            <div
               ref={buttonRef}
               className={classNames({
                  "menu-button": true,
                  active: active === "view",
               })}
               onPointerDown={(e) => {
                  e.nativeEvent.stopPropagation();
                  active === "view" ? setActive(null) : setActive("view");
               }}
               onPointerOver={(e) => {
                  if (active !== null && active !== "view") {
                     setActive("view");
                  }
               }}
            >
               <MenuButton name={t(L.ViewMenu)} />
               <div
                  className={classNames({
                     "menu-popover": true,
                     active: active === "view",
                  })}
               >
                  <div
                     className="menu-popover-item"
                     onPointerDown={(e) => {
                        Singleton().sceneManager.loadScene(WorldScene);
                        setActive(null);
                     }}
                  >
                     <MenuItem check={Singleton().sceneManager.isCurrent(WorldScene)}>{t(L.CityViewMap)}</MenuItem>
                  </div>
                  <div
                     className="menu-popover-item"
                     onPointerDown={(e) => {
                        Singleton().sceneManager.loadScene(TechTreeScene);
                        setActive(null);
                     }}
                  >
                     <MenuItem check={Singleton().sceneManager.isCurrent(TechTreeScene)}>{t(L.ResearchMenu)}</MenuItem>
                  </div>
                  {/* <div
                     className="menu-popover-item"
                     onPointerDown={(e) => {
                        Singleton().sceneManager.loadScene(RomeProvinceScene);
                        setActive(null);
                     }}
                  >
                     <MenuItem check={Singleton().sceneManager.isCurrent(RomeProvinceScene)}>
                        {t(L.RomeMapMenu)}
                     </MenuItem>
                  </div> */}
                  {sizeOf(Tick.current.playerTradeBuildings) <= 0 ? null : (
                     <div
                        className="menu-popover-item"
                        onPointerDown={(e) => {
                           Singleton().sceneManager.loadScene(PlayerMapScene);
                           setActive(null);
                        }}
                     >
                        <MenuItem check={Singleton().sceneManager.isCurrent(PlayerMapScene)}>
                           {t(L.PlayerMapMenu)}
                        </MenuItem>
                     </div>
                  )}
               </div>
            </div>
            <div
               ref={buttonRef}
               className={classNames({
                  "menu-button": true,
                  active: active === "options",
               })}
               onPointerDown={(e) => {
                  e.nativeEvent.stopPropagation();
                  active === "options" ? setActive(null) : setActive("options");
               }}
               onPointerOver={(e) => {
                  if (active !== null && active !== "options") {
                     setActive("options");
                  }
               }}
            >
               <MenuButton name={t(L.OptionsMenu)} />
               <div
                  className={classNames({
                     "menu-popover": true,
                     active: active === "options",
                  })}
               >
                  <div
                     className="menu-popover-item"
                     onPointerDown={() => {
                        gameOptions.useModernUI = !gameOptions.useModernUI;
                        notifyGameOptionsUpdate();
                        syncUITheme();
                        setActive(null);
                     }}
                  >
                     <MenuItem check={gameOptions.useModernUI}>{t(L.OptionsUseModernUI)}</MenuItem>
                  </div>
               </div>
            </div>
            <div
               ref={buttonRef}
               className={classNames({
                  "menu-button": true,
                  active: active === "help",
               })}
               onPointerDown={(e) => {
                  e.nativeEvent.stopPropagation();
                  active === "help" ? setActive(null) : setActive("help");
               }}
               onPointerOver={(e) => {
                  if (active !== null && active !== "help") {
                     setActive("help");
                  }
               }}
            >
               <MenuButton name={t(L.HelpMenu)}></MenuButton>
               <div
                  className={classNames({
                     "menu-popover": true,
                     active: active === "help",
                  })}
               >
                  <div
                     className="menu-popover-item"
                     onPointerDown={() => {
                        showModal(<AboutModal />);
                     }}
                  >
                     <MenuItem check={false}>{t(L.About)}</MenuItem>
                  </div>
               </div>
            </div>
         </div>
         <div className="separator"></div>
      </>
   );
}
