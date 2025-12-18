import { useEffect, useState } from "react";
import type { IGetVotedBoostResponse } from "../../../shared/utilities/Database";
import { L, t } from "../../../shared/utilities/i18n";
import { client } from "../rpc/RPCClient";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { html } from "./RenderHTMLComponent";
import { SpaceshipIdleComponent } from "./SpaceshipIdleComponent";
import { UpgradeableWonderComponent } from "./UpgradeableWonderComponent";
import { VotedBoostsComponent } from "./VotedBoostsComponent";

const sortingState = { column: 1, asc: true };

export function WorldTradeOrganizationBuildingBody({
   gameState,
   xy,
}: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   const [response, setResponse] = useState<IGetVotedBoostResponse | null>(null);
   useEffect(() => {
      client.getVotedBoosts().then(setResponse);
   }, []);
   if (!building) {
      return null;
   }
   return (
      <div className="window-body">
         <SpaceshipIdleComponent gameState={gameState} type={building.type} />
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <UpgradeableWonderComponent gameState={gameState} xy={xy} />
         <VotedBoostsComponent
            currentVoteTitle={(id) => t(L.WTOVoteCurrent, { id })}
            nextVoteTitle={(id) => t(L.WTOVoteNext, { id })}
            description={html(t(L.WTOVoteDescriptionHTML))}
            getVotedBoosts={client.getTradeTileBonusVotes}
            voteBoosts={client.voteTradeTileBonus}
         />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
