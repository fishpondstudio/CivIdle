import Tippy from "@tippyjs/react";
import { applyToAllBuildings } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { type IBuildingData } from "../../../shared/logic/Tile";
import { firstKeyOf, sizeOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { playClick } from "../visuals/Sound";

export function ApplyToAllComponent<T extends IBuildingData>({
   building,
   getOptions,
   gameState,
}: {
   building: T;
   getOptions: (s: IBuildingData) => Partial<T>;
   gameState: GameState;
}): React.ReactNode {
   const def = Config.Building[building.type];
   const options = useGameOptions();
   const property = getOptions(building);
   console.assert(sizeOf(property) === 1);
   const propertyKey = firstKeyOf(property) as keyof IBuildingData;
   return (
      <div className="text-small row">
         <Tippy content={t(L.ApplyToAllBuilding, { building: def.name() })}>
            <button
               style={{ width: 27, padding: 0 }}
               onClick={() => {
                  playClick();
                  applyToAllBuildings(building.type, getOptions, gameState);
               }}
            >
               <div className="m-icon small">published_with_changes</div>
            </button>
         </Tippy>
         <div className="f1"></div>
         <Tippy
            content={t(L.SetAsDefaultBuilding, {
               building: def.name(),
            })}
         >
            <button
               style={{ width: 27, padding: 0 }}
               onClick={() => {
                  playClick();
                  const defaults = options.buildingDefaults;
                  if (!defaults[building.type]) {
                     defaults[building.type] = {};
                  }
                  Object.assign(defaults[building.type]!, getOptions(building));
                  notifyGameOptionsUpdate();
               }}
            >
               <div className="m-icon small">settings_heart</div>
            </button>
         </Tippy>
      </div>
   );
}
