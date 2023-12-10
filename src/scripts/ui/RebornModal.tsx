import { getGameOptions, resetCurrentCity, saveGame } from "../Global";
import { GreatPerson } from "../definitions/GreatPersonDefinitions";
import { Config } from "../logic/Constants";
import { GameState, GreatPeopleChoice } from "../logic/GameState";
import { getGreatPeopleAtReborn } from "../logic/RebornLogic";
import { Tick } from "../logic/TickLogic";
import { keysOf, reduceOf, shuffle } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { playClick } from "../visuals/Sound";
import { hideModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { WarningComponent } from "./WarningComponent";

export function RebornModal({ gameState }: { gameState: GameState }): React.ReactNode {
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Reborn)}</div>
         </div>
         <div className="window-body">
            <WarningComponent icon="info">
               Your will start a new empire but you can take all the great people from this run,
               plus extra great people based on your total empire value.
            </WarningComponent>
            <div className="sep10"></div>
            <fieldset>
               <div className="row">
                  <div className="f1">{t(L.GreatPeopleThisRun)}</div>
                  <div className="text-strong">
                     {reduceOf(
                        gameState.greatPeople,
                        (prev, k, v) => {
                           return prev + v;
                        },
                        0,
                     )}
                  </div>
               </div>
               <div className="sep5"></div>
               <div className="row">
                  <div className="f1">{t(L.TotalEmpireValue)}</div>
                  <div className="text-strong">
                     <FormatNumber value={Tick.current.totalValue} />
                  </div>
               </div>
               <div className="sep5"></div>
               <div className="row">
                  <div className="f1">{t(L.ExtraGreatPeopleAtReborn)}</div>
                  <div className="text-strong">{getGreatPeopleAtReborn()}</div>
               </div>
            </fieldset>
            <div className="sep5"></div>
            <div className="text-right row" style={{ justifyContent: "flex-end" }}>
               <button
                  style={{ padding: "0 15px" }}
                  onClick={() => {
                     playClick();
                     hideModal();
                  }}
               >
                  {t(L.Cancel)}
               </button>
               <div style={{ width: "6px" }} />
               <button
                  style={{ padding: "0 15px" }}
                  onClick={() => {
                     const amount = getGreatPeopleAtReborn();
                     let candidates = shuffle(keysOf(Config.GreatPerson));
                     for (let i = 0; i < amount; i++) {
                        const choice: GreatPerson[] = [];
                        for (let i = 0; i < 3; i++) {
                           if (candidates.length === 0) {
                              candidates = shuffle(keysOf(Config.GreatPerson));
                           }
                           choice.push(candidates.pop()!);
                        }
                        getGameOptions().greatPeopleChoices.push(choice as GreatPeopleChoice);
                     }
                     resetCurrentCity();
                     saveGame(true).catch(console.error);
                     playClick();
                  }}
               >
                  {t(L.Reborn)}
               </button>
            </div>
         </div>
      </div>
   );
}
