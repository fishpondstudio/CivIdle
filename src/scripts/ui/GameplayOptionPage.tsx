import Tippy from "@tippyjs/react";
import { Config } from "../../../shared/logic/Config";
import { MAX_OFFLINE_PRODUCTION_SEC } from "../../../shared/logic/Constants";
import {
   ExtraTileInfoTypes,
   getTranslatedPercentage,
   type ExtraTileInfoType,
} from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate, notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import {
   PRIORITY_MAX,
   PRIORITY_MIN,
   STOCKPILE_CAPACITY_MAX,
   STOCKPILE_CAPACITY_MIN,
   STOCKPILE_MAX_MAX,
   STOCKPILE_MAX_MIN,
} from "../../../shared/logic/Tile";
import { clearTransportSourceCache } from "../../../shared/logic/Update";
import {
   clamp,
   formatHM,
   formatPercent,
   keysOf,
   safeParseInt,
   sizeOf,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions, useGameState } from "../Global";
import { jsxMapOf } from "../utilities/Helper";
import { openUrl } from "../utilities/Platform";
import { playClick } from "../visuals/Sound";
import { ChangeSoundComponent } from "./ChangeSoundComponent";
import { LanguageSelect } from "./LanguageSelectComponent";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { WarningComponent } from "./WarningComponent";

export function GameplayOptionPage(): React.ReactNode {
   const options = useGameOptions();
   const gs = useGameState();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Gameplay)}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <legend>{t(L.Language)}</legend>
               <LanguageSelect className="w100" />
               {options.language !== "en" ? (
                  <div
                     className="mt5 text-link"
                     onClick={() =>
                        openUrl("https://github.com/fishpondstudio/CivIdle/tree/main/shared/languages")
                     }
                  >
                     {t(L.TranslationPercentage, {
                        language: L.CurrentLanguage,
                        percentage: formatPercent(getTranslatedPercentage()),
                     })}
                  </div>
               ) : null}
            </fieldset>
            <fieldset>
               <legend>{t(L.GlobalBuildingDefault)}</legend>
               <div className="row mb5">
                  <div className="f1">{t(L.DefaultBuildingLevel)}</div>
                  <div className="text-strong">{options.defaultBuildingLevel}</div>
               </div>
               <input
                  type="range"
                  min={1}
                  max={50}
                  step="1"
                  value={options.defaultBuildingLevel}
                  onChange={(e) => {
                     options.defaultBuildingLevel = clamp(safeParseInt(e.target.value, 1), 1, 50);
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <div className="sep10" />
               <div className="separator"></div>
               <div className="row mb5">
                  <div className="f1">{t(L.DefaultProductionPriority)}</div>
                  <div className="text-strong">{options.defaultProductionPriority}</div>
               </div>
               <input
                  type="range"
                  min={PRIORITY_MIN}
                  max={PRIORITY_MAX}
                  step="1"
                  value={options.defaultProductionPriority}
                  onChange={(e) => {
                     options.defaultProductionPriority = safeParseInt(e.target.value, PRIORITY_MIN);
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <div className="sep10" />
               <div className="separator" />
               <div className="row mb5">
                  <div className="f1">{t(L.DefaultConstructionPriority)}</div>
                  <div className="text-strong">{options.defaultConstructionPriority}</div>
               </div>
               <input
                  type="range"
                  min={PRIORITY_MIN}
                  max={PRIORITY_MAX}
                  step="1"
                  value={options.defaultConstructionPriority}
                  onChange={(e) => {
                     options.defaultConstructionPriority = safeParseInt(e.target.value, PRIORITY_MIN);
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <div className="sep10" />
               <div className="separator"></div>
               <div className="row mb5">
                  <div className="f1">{t(L.DefaultStockpileSettings)}</div>
                  <div className="text-strong">{options.defaultStockpileCapacity}x</div>
               </div>
               <input
                  type="range"
                  min={STOCKPILE_CAPACITY_MIN}
                  max={STOCKPILE_CAPACITY_MAX}
                  value={options.defaultStockpileCapacity}
                  onChange={(e) => {
                     options.defaultStockpileCapacity = Number.parseInt(e.target.value, 10);
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <div className="sep10" />
               <div className="separator" />
               <div className="row mb5">
                  <div className="f1">{t(L.DefaultStockpileMax)}</div>
                  <div className="text-strong">
                     {options.defaultStockpileMax <= 0
                        ? t(L.StockpileMaxUnlimited)
                        : `${options.defaultStockpileMax}x`}
                  </div>
               </div>
               <input
                  type="range"
                  min={STOCKPILE_MAX_MIN}
                  max={STOCKPILE_MAX_MAX}
                  step="5"
                  value={options.defaultStockpileMax}
                  onChange={(e) => {
                     options.defaultStockpileMax = safeParseInt(e.target.value, 1);
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <div className="sep10" />
               <div className="separator" />
               <ToggleComponent
                  title={t(L.GreedyTransport)}
                  contentHTML={t(L.GreedyTransportDescHTML)}
                  value={options.greedyTransport}
                  onValueChange={(value) => {
                     playClick();
                     options.greedyTransport = value;
                     notifyGameOptionsUpdate(options);
                  }}
               />
            </fieldset>
            <fieldset>
               <legend>{t(L.OfflineProduction)}</legend>
               <WarningComponent icon="info" className="mb10 text-small">
                  <RenderHTML
                     html={t(L.OfflineProductionTimeDescHTML, {
                        time: formatHM(MAX_OFFLINE_PRODUCTION_SEC * 1000),
                     })}
                  />
               </WarningComponent>
               <input
                  id="building-capacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={options.offlineProductionPercent}
                  onChange={(e) => {
                     options.offlineProductionPercent = Number.parseFloat(e.target.value);
                     notifyGameStateUpdate();
                  }}
                  className="mh0"
               />
               <div className="sep5" />
               <div className="row">
                  <div>{t(L.TimeWarp)}</div>
                  <div className="f1"></div>
                  <div>{t(L.OfflineProduction)}</div>
               </div>
               <div className="separator"></div>
               <div className="row mt5">
                  <div className="f1">{t(L.OfflineProductionTime)}</div>
                  <div className="text-strong">
                     {formatHM(options.offlineProductionPercent * MAX_OFFLINE_PRODUCTION_SEC * 1000)}
                  </div>
               </div>
               <div className="row mt5">
                  <div className="f1">{t(L.TimeWarp)}</div>
                  <div className="text-strong">
                     {formatHM((1 - options.offlineProductionPercent) * MAX_OFFLINE_PRODUCTION_SEC * 1000)}
                  </div>
               </div>
            </fieldset>
            <fieldset>
               <legend>{t(L.ResourceBar)}</legend>
               <div className="row">
                  <div className="f1">{t(L.ResourceBarShowUncappedHappiness)}</div>
                  <div
                     onClick={() => {
                        playClick();
                        options.resourceBarShowUncappedHappiness = !options.resourceBarShowUncappedHappiness;
                        notifyGameOptionsUpdate(options);
                     }}
                     className="ml10 pointer"
                  >
                     {options.resourceBarShowUncappedHappiness ? (
                        <div className="m-icon text-green">toggle_on</div>
                     ) : (
                        <div className="m-icon text-grey">toggle_off</div>
                     )}
                  </div>
               </div>
               <div className="separator" />
               <div className="row">
                  <RenderHTML className="f1" html={t(L.ResourceBarExcludeTurnedOffOrNoActiveTransportHTML)} />
                  <div
                     onClick={() => {
                        playClick();
                        options.resourceBarExcludeTurnedOffOrNoActiveTransport =
                           !options.resourceBarExcludeTurnedOffOrNoActiveTransport;
                        notifyGameOptionsUpdate(options);
                     }}
                     className="ml10 pointer"
                  >
                     {options.resourceBarExcludeTurnedOffOrNoActiveTransport ? (
                        <div className="m-icon text-green">toggle_on</div>
                     ) : (
                        <div className="m-icon text-grey">toggle_off</div>
                     )}
                  </div>
               </div>
               <div className="separator" />
               <div className="row">
                  <RenderHTML className="f1" html={t(L.ResourceBarExcludeStorageFullHTML)} />
                  <div
                     onClick={() => {
                        playClick();
                        options.resourceBarExcludeStorageFull = !options.resourceBarExcludeStorageFull;
                        notifyGameOptionsUpdate(options);
                     }}
                     className="ml10 pointer"
                  >
                     {options.resourceBarExcludeStorageFull ? (
                        <div className="m-icon text-green">toggle_on</div>
                     ) : (
                        <div className="m-icon text-grey">toggle_off</div>
                     )}
                  </div>
               </div>
            </fieldset>
            <fieldset>
               <legend>{t(L.ExtraTileInfoType)}</legend>
               <RenderHTML className="f1 mb5" html={t(L.ExtraTileInfoTypeDesc)} />
               <select
                  value={options.extraTileInfoType}
                  onChange={(e) => {
                     options.extraTileInfoType = e.target.value as ExtraTileInfoType;
                     notifyGameOptionsUpdate(options);
                  }}
                  className="w100"
               >
                  {jsxMapOf(ExtraTileInfoTypes, (type, name) => {
                     return (
                        <option key={type} value={type}>
                           {name()}
                        </option>
                     );
                  })}
               </select>
            </fieldset>
            <fieldset>
               <legend>{t(L.PorcelainTower)}</legend>
               <ToggleComponent
                  title={t(L.PorcelainTowerMaxPickPerRoll)}
                  contentHTML={t(L.PorcelainTowerMaxPickPerRollDescHTML)}
                  value={options.porcelainTowerMaxPickPerRoll}
                  onValueChange={(value) => {
                     playClick();
                     options.porcelainTowerMaxPickPerRoll = value;
                     notifyGameOptionsUpdate(options);
                  }}
               />
            </fieldset>
            <fieldset>
               <legend>{t(L.Sound)}</legend>
               <ChangeSoundComponent />
               {options.soundEffect ? (
                  <>
                     <div className="separator" />
                     <div className="row">
                        <div className="f1">{t(L.TradeFillSound)}</div>
                        <div
                           onClick={() => {
                              options.tradeFilledSound = !options.tradeFilledSound;
                              playClick();
                              notifyGameOptionsUpdate(options);
                           }}
                           className="ml10 pointer"
                        >
                           {options.tradeFilledSound ? (
                              <div className="m-icon text-green">toggle_on</div>
                           ) : (
                              <div className="m-icon text-grey">toggle_off</div>
                           )}
                        </div>
                     </div>
                  </>
               ) : null}
            </fieldset>
            <fieldset>
               <legend>{t(L.Chat)}</legend>
               <div className="row">
                  <div className="f1">{t(L.ChatHideLatestMessage)}</div>
                  <div
                     onClick={() => {
                        playClick();
                        options.chatHideLatestMessage = !options.chatHideLatestMessage;
                        notifyGameOptionsUpdate(options);
                     }}
                     className="ml10 pointer"
                  >
                     {options.chatHideLatestMessage ? (
                        <div className="m-icon text-green">toggle_on</div>
                     ) : (
                        <div className="m-icon text-grey">toggle_off</div>
                     )}
                  </div>
               </div>
            </fieldset>
            <fieldset>
               <legend>{t(L.Performance)}</legend>
               <ToggleComponent
                  title={t(L.TransportPlanCache)}
                  contentHTML={t(L.TransportPlanCacheDescHTML)}
                  value={options.enableTransportSourceCache}
                  onValueChange={(value) => {
                     playClick();
                     options.enableTransportSourceCache = value;
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <button
                  className="jcc w100 mt10"
                  onClick={() => {
                     playClick();
                     clearTransportSourceCache();
                  }}
               >
                  {t(L.ClearTransportPlanCache)}
               </button>
               <div className="separator" />
               <ToggleComponent
                  title={t(L.ShowTransportArrow)}
                  contentHTML={t(L.ShowTransportArrowDescHTML)}
                  value={options.showTransportArrow}
                  onValueChange={(value) => {
                     playClick();
                     options.showTransportArrow = value;
                     notifyGameOptionsUpdate(options);
                  }}
               />
            </fieldset>
            {sizeOf(options.buildingDefaults) > 0 ? (
               <fieldset>
                  <legend>{t(L.BuildingDefaults)}</legend>
                  <div className="table-view">
                     <table>
                        <tbody>
                           {keysOf(options.buildingDefaults)
                              .sort((a, b) =>
                                 Config.Building[a].name().localeCompare(Config.Building[b].name()),
                              )
                              .map((building) => {
                                 const value = options.buildingDefaults[building];
                                 return (
                                    <tr key={building}>
                                       <td>{Config.Building[building].name()}</td>
                                       <td>
                                          <TextWithHelp
                                             content={t(L.BuildingDefaultsCount, { count: sizeOf(value) })}
                                          >
                                             {sizeOf(value)}
                                          </TextWithHelp>
                                       </td>
                                       <td style={{ width: 0 }}>
                                          <Tippy content={t(L.BuildingDefaultsRemove)}>
                                             <div
                                                className="text-red m-icon small"
                                                onClick={() => {
                                                   delete options.buildingDefaults[building];
                                                   notifyGameOptionsUpdate();
                                                }}
                                             >
                                                delete
                                             </div>
                                          </Tippy>
                                       </td>
                                    </tr>
                                 );
                              })}
                        </tbody>
                     </table>
                  </div>
               </fieldset>
            ) : null}
         </div>
      </div>
   );
}

function ToggleComponent({
   title,
   contentHTML,
   value,
   onValueChange,
}: {
   title: string;
   contentHTML: string;
   value: boolean;
   onValueChange: (newValue: boolean) => void;
}): React.ReactNode {
   return (
      <div className="row">
         <div className="f1">
            <div>{title}</div>
            <RenderHTML className="text-desc text-small" html={contentHTML} />
         </div>
         <div
            onClick={() => {
               playClick();
               onValueChange(!value);
            }}
            className="ml10 pointer"
         >
            {value ? (
               <div className="m-icon text-green">toggle_on</div>
            ) : (
               <div className="m-icon text-grey">toggle_off</div>
            )}
         </div>
      </div>
   );
}
