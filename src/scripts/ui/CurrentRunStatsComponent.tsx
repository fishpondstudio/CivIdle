import type { GameState } from "../../../shared/logic/GameState";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import { getPermanentGreatPeopleLevel } from "../../../shared/logic/RebirthLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { formatHMS, getHMS, SECOND } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { FormatNumber } from "./HelperComponents";
import { TextWithHelp } from "./TextWithHelpComponent";

export function CurrentRunStatsComponent({
   gameState,
   className,
}: { gameState: GameState; className?: string }): React.ReactNode {
   const totalPGPLevel = getPermanentGreatPeopleLevel(getGameOptions());
   return (
      <ul className={className}>
         <li className="row">
            <div className="f1">{t(L.TotalGameTimeThisRun)}</div>
            <div>
               <TextWithHelp content={getHMS(gameState.tick * SECOND).join(":")}>
                  {formatHMS(gameState.tick * SECOND)}
               </TextWithHelp>
            </div>
         </li>
         <li className="row">
            <div className="f1">{t(L.TotalEmpireValuePerCycle)}</div>
            <FormatNumber value={Tick.current.totalValue / gameState.tick} />
         </li>
         <li className="row">
            <div className="f1">{t(L.TotalEmpireValuePerCyclePerGreatPeopleLevel)}</div>
            <FormatNumber
               value={totalPGPLevel === 0 ? 0 : Tick.current.totalValue / gameState.tick / totalPGPLevel}
            />
         </li>
         <li className="row">
            <div className="f1">
               <TextWithHelp content={t(L.TotalWallTimeThisRunTooltip)}>
                  {t(L.TotalWallTimeThisRun)}
               </TextWithHelp>
            </div>
            <div>
               <TextWithHelp content={getHMS(gameState.seconds * SECOND).join(":")}>
                  {formatHMS(gameState.seconds * SECOND)}
               </TextWithHelp>
            </div>
         </li>
         <li className="row">
            <div className="f1">{t(L.TotalEmpireValuePerWallSecond)}</div>
            <FormatNumber value={Tick.current.totalValue / gameState.seconds} />
         </li>
         <li className="row">
            <div className="f1">{t(L.TotalEmpireValuePerWallSecondPerGreatPeopleLevel)}</div>
            <FormatNumber
               value={totalPGPLevel === 0 ? 0 : Tick.current.totalValue / gameState.seconds / totalPGPLevel}
            />
         </li>
      </ul>
   );
}
