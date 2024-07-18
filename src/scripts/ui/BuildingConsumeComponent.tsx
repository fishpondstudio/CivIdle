import type React from "react";
import { NoPrice, NoStorage, type Resource } from "../../../shared/definitions/ResourceDefinitions";
import { IOCalculation } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getBuildingIO, unlockedResources } from "../../../shared/logic/IntraTickCache";
import { getBuildingsThatProduce } from "../../../shared/logic/ResourceLogic";
import type { ICloneBuildingData } from "../../../shared/logic/Tile";
import { isEmpty, keysOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { ApplyToAllComponent } from "./ApplyToAllComponent";
import { BuildingIOTreeViewComponent } from "./BuildingIOTreeViewComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function BuildingConsumeComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const input = getBuildingIO(xy, "input", IOCalculation.Capacity, gameState);
   if (isEmpty(input)) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.Consume)}</legend>
         <ChooseResource gameState={gameState} xy={xy} />
         <BuildingIOTreeViewComponent gameState={gameState} xy={xy} type="input" />
      </fieldset>
   );
}

function ChooseResource({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;

   if (building && (building.type === "CloneFactory" || building.type === "CloneLab")) {
      const c = building as ICloneBuildingData;
      const resources = keysOf(unlockedResources(gameState))
         .filter((r) => !NoStorage[r] && !NoPrice[r])
         .sort((a, b) => Config.Resource[a].name().localeCompare(Config.Resource[b].name()));
      return (
         <>
            <WarningComponent icon="info" className="mb10 text-small">
               <RenderHTML
                  html={t(L.CloneFactoryInputDescHTML, {
                     res: Config.Resource[c.inputResource].name(),
                     buildings: getBuildingsThatProduce(c.inputResource)
                        .map((b) => Config.Building[b].name())
                        .join(", "),
                  })}
               />
            </WarningComponent>
            <select
               className="w100"
               value={c.inputResource}
               onChange={(e) => {
                  playClick();
                  const res = e.target.value as Resource;
                  if (c.inputResource !== res) {
                     c.inputResource = res;
                     c.transportedAmount = 0;
                     notifyGameStateUpdate();
                  }
               }}
            >
               {resources.map((r) => (
                  <option key={r} value={r}>
                     {Config.Resource[r].name()}
                  </option>
               ))}
            </select>
            <div className="sep10" />
            <ApplyToAllComponent
               xy={xy}
               getOptions={() => {
                  return { inputResource: c.inputResource } as ICloneBuildingData;
               }}
               gameState={gameState}
            />
            <div className="separator" />
         </>
      );
   }
   return null;
}
