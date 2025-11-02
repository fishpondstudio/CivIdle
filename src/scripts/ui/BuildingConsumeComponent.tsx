import type React from "react";
import { NoPrice, NoStorage, type Material } from "../../../shared/definitions/MaterialDefinitions";
import { IOFlags } from "../../../shared/logic/BuildingLogic";
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
   const input = getBuildingIO(xy, "input", IOFlags.Capacity, gameState);
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
         .sort((a, b) => Config.Material[a].name().localeCompare(Config.Material[b].name()));
      return (
         <>
            {building.type === "CloneFactory" ? (
               <WarningComponent icon="info" className="mb10 text-small">
                  <RenderHTML
                     html={t(L.CloneFactoryInputDescHTML, {
                        res: Config.Material[c.inputResource].name(),
                        buildings: getBuildingsThatProduce(c.inputResource)
                           .map((b) => Config.Building[b].name())
                           .join(", "),
                     })}
                  />
               </WarningComponent>
            ) : null}
            <select
               className="w100"
               value={c.inputResource}
               onChange={(e) => {
                  playClick();
                  const res = e.target.value as Material;
                  if (c.inputResource !== res) {
                     c.inputResource = res;
                     c.transportedAmount = 0;
                     notifyGameStateUpdate();
                  }
               }}
            >
               {resources.map((r) => (
                  <option key={r} value={r}>
                     {Config.Material[r].name()}
                  </option>
               ))}
            </select>
            <div className="sep10" />
            <ApplyToAllComponent
               xy={xy}
               getOptions={() => {
                  return { inputResource: c.inputResource, transportedAmount: 0 } as ICloneBuildingData;
               }}
               gameState={gameState}
            />
            <div className="separator" />
         </>
      );
   }
   return null;
}
