import { L, t } from "../../../shared/utilities/i18n";
import { client } from "../rpc/RPCClient";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { html } from "./RenderHTMLComponent";
import { UpgradeableWonderComponent } from "./UpgradeableWonderComponent";
import { VotedBoostsComponent } from "./VotedBoostsComponent";

export function UnitedNationsBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
         <VotedBoostsComponent
            currentVoteTitle={(id) => t(L.UNGeneralAssemblyCurrent, { id })}
            nextVoteTitle={(id) => t(L.UNGeneralAssemblyNext, { id })}
            description={html(t(L.UNVoteDescriptionHTML))}
            getVotedBoosts={client.getVotedBoosts}
            voteBoosts={client.voteBoosts}
         />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
