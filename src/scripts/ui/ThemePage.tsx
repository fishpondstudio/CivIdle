import Tippy from "@tippyjs/react";
import { Config } from "../../../shared/logic/Config";
import {
   CursorOptions,
   PremiumTileTextures,
   ThemeColorNames,
   TileTextures,
   resetThemeBuildingColors,
   resetThemeColor,
   resetThemeResourceColors,
   type CursorOption,
} from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { compareResources } from "../../../shared/logic/ResourceLogic";
import { UserAttributes } from "../../../shared/utilities/Database";
import { clamp, hasFlag, keysOf, safeParseFloat, safeParseInt } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { syncFontSizeScale, useGameOptions } from "../Global";
import { copyBuildingColorToResource, randomizeBuildingAndResourceColor } from "../logic/ThemeColor";
import { getUser } from "../rpc/RPCClient";
import { jsxMapOf } from "../utilities/Helper";
import { Singleton } from "../utilities/Singleton";
import { playClick, playError } from "../visuals/Sound";
import { ChangeModernUIComponent } from "./ChangeModernUIComponent";
import { ColorPicker } from "./ColorPicker";
import { showToast } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { TileTextureComponent } from "./TextureSprites";
import { TitleBarComponent } from "./TitleBarComponent";
import { ToggleComponent } from "./ToggleComponent";

export function ThemePage(): React.ReactNode {
   const gameOptions = useGameOptions();
   return (
      <div className="window">
         <TitleBarComponent>{t(L.Theme)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <ChangeModernUIComponent />
               {gameOptions.useModernUI ? (
                  <>
                     <div className="separator" />
                     <div className="row">
                        <div className="f1">
                           <div>{t(L.FontSizeScale)}</div>
                           <RenderHTML className="text-desc text-small" html={t(L.FontSizeScaleDescHTML)} />
                        </div>
                        <select
                           className="ml10"
                           value={gameOptions.fontSizeScale}
                           onChange={(e) => {
                              gameOptions.fontSizeScale = safeParseFloat(e.target.value, 1);
                              syncFontSizeScale(Singleton().sceneManager.getContext().app, gameOptions);
                              notifyGameOptionsUpdate(gameOptions);
                           }}
                        >
                           <option value={0.6}>0.6x</option>
                           <option value={0.7}>0.7x</option>
                           <option value={0.8}>0.8x</option>
                           <option value={0.9}>0.9x</option>
                           <option value={1}>1x</option>
                           <option value={1.1}>1.1x</option>
                           <option value={1.2}>1.2x</option>
                           <option value={1.3}>1.3x</option>
                           <option value={1.4}>1.4x</option>
                           <option value={1.5}>1.5x</option>
                        </select>
                     </div>
                     <div className="inset-shallow row mt10 p5">
                        <div className="f1">{t(L.MobileOverride)}</div>
                        <select
                           className="ml10"
                           value={gameOptions.fontSizeScaleMobile}
                           onChange={(e) => {
                              gameOptions.fontSizeScaleMobile = safeParseFloat(e.target.value, 1);
                              syncFontSizeScale(Singleton().sceneManager.getContext().app, gameOptions);
                              notifyGameOptionsUpdate(gameOptions);
                           }}
                        >
                           <option value={0.6}>0.6x</option>
                           <option value={0.7}>0.7x</option>
                           <option value={0.8}>0.8x</option>
                           <option value={0.9}>0.9x</option>
                           <option value={1}>1x</option>
                           <option value={1.1}>1.1x</option>
                           <option value={1.2}>1.2x</option>
                           <option value={1.3}>1.3x</option>
                           <option value={1.4}>1.4x</option>
                           <option value={1.5}>1.5x</option>
                        </select>
                     </div>
                     <div className="separator" />
                  </>
               ) : null}
               <div className="separator" />
               <div className="row">
                  <div className="f1">
                     <div>{t(L.SidePanelWidth)}</div>
                     <RenderHTML className="text-desc text-small" html={t(L.SidePanelWidthDescHTML)} />
                  </div>
                  <select
                     className="ml10"
                     value={gameOptions.sidePanelWidth}
                     onChange={(e) => {
                        gameOptions.sidePanelWidth = safeParseInt(e.target.value, 400);
                        notifyGameOptionsUpdate(gameOptions);
                     }}
                  >
                     <option value={400}>400px</option>
                     <option value={450}>450px</option>
                     <option value={500}>500px</option>
                  </select>
               </div>
               <div className="inset-shallow row mt10 p5">
                  <div className="f1">{t(L.MobileOverride)}</div>
                  <select
                     className="ml10"
                     value={gameOptions.sidePanelWidthMobile}
                     onChange={(e) => {
                        gameOptions.sidePanelWidthMobile = safeParseInt(e.target.value, 400);
                        notifyGameOptionsUpdate(gameOptions);
                     }}
                  >
                     <option value={400}>400px</option>
                     <option value={450}>450px</option>
                     <option value={500}>500px</option>
                  </select>
               </div>
               <div className="separator" />
               <div className="row">
                  <div className="f1">
                     <div>{t(L.CursorStyle)}</div>
                     <RenderHTML className="text-desc text-small" html={t(L.CursorStyleDescHTML)} />
                  </div>
                  <select
                     className="ml10"
                     value={gameOptions.cursor}
                     onChange={(e) => {
                        gameOptions.cursor = e.target.value as CursorOption;
                        notifyGameOptionsUpdate(gameOptions);
                     }}
                  >
                     {jsxMapOf(CursorOptions, (k, name) => {
                        return (
                           <option key={k} value={k}>
                              {name()}
                           </option>
                        );
                     })}
                  </select>
               </div>
               <div className="separator" />
               <div className="row">
                  <div className="f1 mr20">
                     <div>{t(L.ScrollSensitivity)}</div>
                     <RenderHTML className="text-desc text-small" html={t(L.ScrollSensitivityDescHTML)} />
                  </div>
                  <input
                     type="text"
                     style={{ width: 60, textAlign: "right" }}
                     value={gameOptions.scrollSensitivity}
                     onChange={(e) => {
                        gameOptions.scrollSensitivity = clamp(safeParseFloat(e.target.value, 1), 0.01, 100);
                        notifyGameOptionsUpdate();
                     }}
                  />
               </div>
               <div className="separator" />
               <ToggleComponent
                  title={t(L.ShowTransportArrow)}
                  contentHTML={t(L.ShowTransportArrowDescHTML)}
                  value={gameOptions.showTransportArrow}
                  onValueChange={(value) => {
                     playClick();
                     gameOptions.showTransportArrow = value;
                     notifyGameOptionsUpdate(gameOptions);
                  }}
               />
            </fieldset>
            <fieldset>
               <legend>{t(L.Tile)}</legend>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                  {TileTextures.map((i) => {
                     return (
                        <div
                           className="pointer"
                           key={i}
                           style={{
                              position: "relative",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                           }}
                           onClick={() => {
                              if (
                                 PremiumTileTextures[i] &&
                                 !hasFlag(getUser()?.attr ?? UserAttributes.None, UserAttributes.DLC1)
                              ) {
                                 playError();
                                 showToast(t(L.ThemePremiumTile));
                                 return;
                              }

                              gameOptions.tileTexture = i;
                              notifyGameOptionsUpdate(gameOptions);
                           }}
                        >
                           <TileTextureComponent tileTexture={i} scale={0.25} />
                           {gameOptions.tileTexture === i ? (
                              <div
                                 style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                 }}
                                 className="m-icon text-green"
                              >
                                 check_circle
                              </div>
                           ) : null}
                        </div>
                     );
                  })}
               </div>
            </fieldset>
            <fieldset>
               <legend>{t(L.ThemeColor)}</legend>
               <div
                  className="mv5 text-link pointer text-strong"
                  onClick={() => {
                     playClick();
                     resetThemeColor();
                  }}
               >
                  {t(L.ThemeColorReset)}
               </div>
               {keysOf(gameOptions.themeColors).map((k) => {
                  if (typeof gameOptions.themeColors[k] === "string") {
                     return (
                        <div key={k} className="row mv5">
                           <div className="f1">{ThemeColorNames[k]()}</div>
                           <ColorPicker
                              value={gameOptions.themeColors[k] as string}
                              onChange={(v) => {
                                 gameOptions.themeColors[k] = v as never;
                                 notifyGameOptionsUpdate();
                              }}
                              timeout={250}
                           />
                        </div>
                     );
                  }
                  if (typeof gameOptions.themeColors[k] === "number") {
                     return (
                        <div key={k} className="row mv5">
                           <div className="f1">{ThemeColorNames[k]()}</div>
                           <input
                              type="number"
                              step="0.1"
                              max="1"
                              min="0"
                              style={{ width: "50px" }}
                              value={gameOptions.themeColors[k]}
                              onChange={(v) => {
                                 const parsed = Number.parseFloat(v.target.value);
                                 if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
                                    gameOptions.themeColors[k] = parsed as never;
                                    notifyGameOptionsUpdate();
                                 }
                              }}
                           />
                        </div>
                     );
                  }
               })}
            </fieldset>

            <fieldset>
               <legend>{t(L.BuildingColor)}</legend>
               <button
                  onClick={() => {
                     randomizeBuildingAndResourceColor(gameOptions);
                     notifyGameOptionsUpdate();
                  }}
                  className="w100 text-strong"
               >
                  {t(L.RandomColorScheme)}
               </button>
               <div
                  className="mv5 text-link pointer text-strong"
                  onClick={() => {
                     playClick();
                     resetThemeBuildingColors();
                  }}
               >
                  {t(L.ThemeColorResetBuildingColors)}
               </div>
               {keysOf(gameOptions.buildingColors)
                  .sort((a, b) => Config.Building[a].name().localeCompare(Config.Building[b].name()))
                  .map((b) => {
                     return (
                        <div key={b} className="row mv5">
                           <div className="f1">{Config.Building[b].name()}</div>
                           <ColorPicker
                              value={gameOptions.buildingColors[b] ?? "#ffffff"}
                              onChange={(v) => {
                                 gameOptions.buildingColors[b] = v;
                                 notifyGameOptionsUpdate();
                              }}
                              timeout={250}
                           />
                        </div>
                     );
                  })}
            </fieldset>

            <fieldset>
               <legend>{t(L.ResourceColor)}</legend>
               <Tippy content={t(L.BuildingColorMatchBuildingTooltip)}>
                  <button
                     onClick={() => {
                        copyBuildingColorToResource(gameOptions);
                        notifyGameOptionsUpdate();
                     }}
                     className="w100 text-strong"
                  >
                     {t(L.BuildingColorMatchBuilding)}
                  </button>
               </Tippy>
               <div
                  className="mv5 text-link pointer text-strong"
                  onClick={() => {
                     playClick();
                     resetThemeResourceColors();
                  }}
               >
                  {t(L.ThemeColorResetResourceColors)}
               </div>
               {keysOf(gameOptions.resourceColors)
                  .sort((a, b) => compareResources(a, b, gameOptions.resourceSortMethod))
                  .map((b) => {
                     return (
                        <div key={b} className="row mv5">
                           <div className="f1">{Config.Resource[b].name()}</div>
                           <ColorPicker
                              value={gameOptions.resourceColors[b] ?? "#ffffff"}
                              onChange={(v) => {
                                 gameOptions.resourceColors[b] = v;
                                 notifyGameOptionsUpdate();
                              }}
                              timeout={250}
                           />
                        </div>
                     );
                  })}
            </fieldset>
         </div>
      </div>
   );
}
