import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { getScienceFromWorkers } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { FESTIVAL_CONVERSION_RATE } from "../../../shared/logic/Constants";
import { GameFeature, hasFeature } from "../../../shared/logic/FeatureLogic";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { HAPPINESS_MULTIPLIER, HappinessNames, getHappinessIcon } from "../../../shared/logic/HappinessLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { formatPercent } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { useCurrentTick } from "../logic/ClientUpdate";
import { jsxMapOf } from "../utilities/Helper";
import { playClick } from "../visuals/Sound";
import { FormatNumber } from "./HelperComponents";
import { ProgressBarComponent } from "./ProgressBarComponent";
import { TextWithHelp } from "./TextWithHelpComponent";

export function HappinessComponent({ open }: { open: boolean }): React.ReactNode {
   const happiness = useCurrentTick().happiness;
   const { workersBeforeHappiness, workersAfterHappiness } = getScienceFromWorkers(useGameState());
   const gs = useGameState();
   const festival = Tick.current.specialBuildings.get("Headquarter")?.building?.resources.Festival ?? 0;
   if (!happiness) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.Happiness)}</legend>
         <div className="row">
            <div>
               <div className="text-red m-icon">{getHappinessIcon(-50)}</div>
            </div>
            <div className="f1 text-center">
               <div className="text-red m-icon">{getHappinessIcon(-25)}</div>
            </div>
            <div>
               <div className="text-desc m-icon">{getHappinessIcon(0)}</div>
            </div>
            <div className="f1 text-center">
               <div className="text-green m-icon">{getHappinessIcon(25)}</div>
            </div>
            <div>
               <div className="text-green m-icon">{getHappinessIcon(50)}</div>
            </div>
         </div>
         <div className="sep5"></div>
         <ProgressBarComponent progress={happiness.normalized} />
         <div className="row">
            <div className="f1">-50</div>
            <div className="f1 text-center">0</div>
            <div className="f1 text-right">50</div>
         </div>
         <div className="sep5"></div>
         <ul className="tree-view">
            <li>
               <details open={open}>
                  <summary className="row">
                     <div className="f1">{t(L.Happiness)}</div>
                     <div className="text-strong">
                        <FormatNumber value={happiness.value} />
                     </div>
                  </summary>
                  <ul>
                     {jsxMapOf(happiness.positive, (type, value) => {
                        return (
                           <li className="row" key={type}>
                              <div className="f1">
                                 <TextWithHelp
                                    content={type === "fromBuildingTypes" ? t(L.WellStockedTooltip) : null}
                                 >
                                    {HappinessNames[type]()}
                                 </TextWithHelp>
                              </div>
                              <div className="text-green">
                                 +<FormatNumber value={value} />
                              </div>
                           </li>
                        );
                     })}
                     {Tick.current.globalMultipliers.happiness.map((m) => {
                        return (
                           <li className="row" key={m.source}>
                              <div className="f1">{m.source}</div>
                              <div className="text-green">
                                 +<FormatNumber value={m.value} />
                              </div>
                           </li>
                        );
                     })}
                     {jsxMapOf(happiness.negative, (type, value) => {
                        return (
                           <li className="row" key={type}>
                              <div className="f1">{HappinessNames[type]()}</div>
                              <div className="text-red">
                                 -<FormatNumber value={value} />
                              </div>
                           </li>
                        );
                     })}
                     <li className="row">
                        <div className="f1">{t(L.HappinessUncapped)}</div>
                        <div
                           className={classNames({
                              "text-strong": true,
                              "text-red": happiness.uncapped < 0,
                              "text-green": happiness.uncapped > 0,
                           })}
                        >
                           <FormatNumber value={happiness.uncapped} />
                        </div>
                     </li>
                  </ul>
               </details>
            </li>
            <li>
               <details open={open}>
                  <summary className="row">
                     <div className="f1">{t(L.WorkerHappinessPercentage)}</div>
                     <div
                        className={classNames({
                           "text-strong": true,
                           "text-red": happiness.workerPercentage < 1,
                           "text-green": happiness.workerPercentage > 1,
                        })}
                     >
                        {formatPercent(happiness.workerPercentage)}
                     </div>
                  </summary>
                  <ul>
                     <li>{t(L.WorkerPercentagePerHappiness, { value: HAPPINESS_MULTIPLIER })}</li>
                     <li className="row">
                        <div className="f1">{t(L.WorkersAvailableBeforeHappinessMultiplier)}</div>
                        <div className="text-strong">
                           <FormatNumber value={workersBeforeHappiness} />
                        </div>
                     </li>
                     <li className="row">
                        <div className="f1">{t(L.WorkersAvailableAfterHappinessMultiplier)}</div>
                        <div className="text-strong">
                           <FormatNumber value={workersAfterHappiness} />
                        </div>
                     </li>
                  </ul>
               </details>
            </li>
         </ul>
         {hasFeature(GameFeature.Festival, gs) ? (
            <>
               <div className="separator" />
               <div className="row text-strong mb5">
                  <div className="m-icon mr5">celebration</div>
                  <Tippy content={Config.City[gs.city].festivalDesc()}>
                     <div>{t(L.StartFestival)}</div>
                  </Tippy>
                  <div className="f1"></div>
                  <div
                     onClick={() => {
                        playClick();
                        gs.festival = !gs.festival;
                        notifyGameStateUpdate();
                     }}
                     className="ml10 pointer"
                  >
                     {gs.festival ? (
                        <div className="m-icon text-green">toggle_on</div>
                     ) : (
                        <div className="m-icon text-grey">toggle_off</div>
                     )}
                  </div>
               </div>
               <ul className="tree-view">
                  <li className="row">
                     <div className="f1">{t(L.Festival)}</div>
                     <div className="text-strong">
                        <FormatNumber value={festival} />
                     </div>
                  </li>
                  <li className="row">
                     <div className="f1">{t(L.FestivalCycle)}</div>
                     <div className="text-strong">
                        <FormatNumber value={Math.floor(festival / FESTIVAL_CONVERSION_RATE)} />
                     </div>
                  </li>
               </ul>
            </>
         ) : null}
      </fieldset>
   );
}
