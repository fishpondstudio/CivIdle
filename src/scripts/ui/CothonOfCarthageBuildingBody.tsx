import { getCarthageCivilizationIdeas } from "../../../shared/logic/BuildingLogic";
import { $t, L } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { IdeaTreeModal } from "./IdeaTreeModal";
import { UpgradeableWonderComponent } from "./UpgradeableWonderComponent";

export function CothonOfCarthageBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const { total, used } = getCarthageCivilizationIdeas(gameState);
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <legend>{$t(L.CivilizationIdeas)}</legend>
            <ul className="tree-view">
               <li className="row">
                  <div className="f1">{$t(L.CothonOfCarthageLevel)}</div>
                  <div className="text-strong text-green">
                     +<FormatNumber value={total} />
                  </div>
               </li>
               <li className="row">
                  <div className="f1">{$t(L.UnlockedIdeas)}</div>
                  <div className="text-strong text-red">
                     -<FormatNumber value={used} />
                  </div>
               </li>
               <li className="row">
                  <div className="f1">{$t(L.AvailableIdeaPoints)}</div>
                  <div className="text-strong">
                     <FormatNumber value={total - used} />
                  </div>
               </li>
            </ul>
            <div className="text-small text-desc mt10">
               {$t(L.EachLevelOfCothonOfCarthageProvides1IdeaPoint)}
            </div>
            <div className="separator" />
            <button
               className="w100 text-strong row"
               onClick={() => {
                  playClick();
                  showModal(<IdeaTreeModal />);
               }}
            >
               <div className="m-icon small">tips_and_updates</div>
               <div className="f1">{$t(L.CivilizationIdeas)}</div>
            </button>
         </fieldset>
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
