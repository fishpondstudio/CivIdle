import Tippy from "@tippyjs/react";
import { useState } from "react";
import { Config } from "../../../shared/logic/Config";
import { MAX_OFFLINE_PRODUCTION_SEC } from "../../../shared/logic/Constants";
import {
   ExtraTileInfoTypes,
   getTranslatedPercentage,
   type ExtraTileInfoType,
} from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import {
   MAX_ELECTRIFICATION_LEVEL,
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
   resolveIn,
   safeParseInt,
   sizeOf,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { Todo } from "../logic/Todo";
import { jsxMapOf } from "../utilities/Helper";
import { openUrl } from "../utilities/Platform";
import { regenerateGreatPersonImages } from "../visuals/GreatPersonVisual";
import { playClick } from "../visuals/Sound";
import { ChangeSoundComponent } from "./ChangeSoundComponent";
import { LanguageSelect } from "./LanguageSelectComponent";
import { MenuComponent } from "./MenuComponent";
import { RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { TitleBarComponent } from "./TitleBarComponent";
import { ToggleComponent } from "./ToggleComponent";
import { WarningComponent } from "./WarningComponent";

export function GameplayOptionPage(): React.ReactNode {
   const options = useGameOptions();
   return (
      <div className="window">
         <TitleBarComponent>{t(L.Gameplay)}</TitleBarComponent>
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
               <div className="separator"></div>
               <div className="row mb5">
                  <div className="f1">{t(L.DefaultProductionPriorityForBuildingsThatProduceWorkers)}</div>
                  <div className="text-strong">{options.defaultWorkerProductionPriority}</div>
               </div>
               <input
                  type="range"
                  min={PRIORITY_MIN}
                  max={PRIORITY_MAX}
                  step="1"
                  value={options.defaultWorkerProductionPriority}
                  onChange={(e) => {
                     options.defaultWorkerProductionPriority = safeParseInt(e.target.value, PRIORITY_MIN);
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
               <div className="separator" />
               <div className="row mb5">
                  <div className="f1">{t(L.DefaultWonderConstructionPriority)}</div>
                  <div className="text-strong">{options.defaultWonderConstructionPriority}</div>
               </div>
               <input
                  type="range"
                  min={PRIORITY_MIN}
                  max={PRIORITY_MAX}
                  step="1"
                  value={options.defaultWonderConstructionPriority}
                  onChange={(e) => {
                     options.defaultWonderConstructionPriority = safeParseInt(e.target.value, PRIORITY_MIN);
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
               <div className="row mb5">
                  <div className="f1">{t(L.DefaultElectrificationLevel)}</div>
                  <div className="text-strong">{options.defaultElectrificationLevel}</div>
               </div>
               <input
                  type="range"
                  min={0}
                  max={MAX_ELECTRIFICATION_LEVEL}
                  step="1"
                  value={options.defaultElectrificationLevel}
                  onChange={(e) => {
                     options.defaultElectrificationLevel = safeParseInt(e.target.value, 0);
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
               <legend>{t(L.Tutorial)}</legend>
               <ToggleComponent
                  title={t(L.ShowTutorial)}
                  contentHTML=""
                  value={options.showTutorial}
                  onValueChange={(value) => {
                     playClick();
                     options.showTutorial = value;
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <div className="separator" />
               {jsxMapOf(Todo, (id, t) => {
                  if (id.startsWith("S")) {
                     return null;
                  }
                  return (
                     <ToggleComponent
                        key={id}
                        title={t.name()}
                        contentHTML=""
                        value={!options.disabledTodos.has(id)}
                        onValueChange={(value) => {
                           playClick();
                           if (value) {
                              options.disabledTodos.delete(id);
                           } else {
                              options.disabledTodos.add(id);
                           }
                           notifyGameOptionsUpdate(options);
                        }}
                     />
                  );
               })}
               <div className="separator" />
               <ToggleComponent
                  title={t(L.ShowWonderPopup)}
                  contentHTML=""
                  value={options.showWonderPopup}
                  onValueChange={(value) => {
                     options.showWonderPopup = value;
                     notifyGameOptionsUpdate(options);
                  }}
               />
               <ToggleComponent
                  title={t(L.ShowNaturalWonderPopup)}
                  contentHTML=""
                  value={options.showNaturalWonderPopup}
                  onValueChange={(value) => {
                     options.showNaturalWonderPopup = value;
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
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={options.offlineProductionPercent}
                  onChange={(e) => {
                     options.offlineProductionPercent = Number.parseFloat(e.target.value);
                     notifyGameOptionsUpdate(options);
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
               <RegenerateGreatPersonImagesButton />
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

function RegenerateGreatPersonImagesButton(): React.ReactNode {
   const [ongoing, setOngoing] = useState(false);
   return (
      <Tippy content={t(L.RegenerateGreatPersonPortraitsDesc)}>
         <button
            disabled={ongoing}
            className="jcc w100 mt10"
            onClick={async () => {
               playClick();
               setOngoing(true);
               await resolveIn(1, null);
               await regenerateGreatPersonImages();
               setOngoing(false);
            }}
         >
            {ongoing ? t(L.Regenerating) : t(L.RegenerateGreatPersonPortraits)}
         </button>
      </Tippy>
   );
}
