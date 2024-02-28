import { applyToAllBuildings } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import type { IBuildingData } from "../../../shared/logic/Tile";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { TextWithHelp } from "./TextWithHelpComponent";

export function ApplyToAllComponent({
   building,
   getOptions,
   gameState,
}: {
   building: IBuildingData;
   getOptions: (s: IBuildingData) => Partial<IBuildingData>;
   gameState: GameState;
}): React.ReactNode {
   const def = Config.Building[building.type];
   return (
      <div className="text-small row">
         <div
            className="text-link"
            onClick={() => {
               playClick();
               applyToAllBuildings(building.type, getOptions, gameState);
            }}
         >
            <TextWithHelp noStyle content={t(L.ApplyToAllBuilding, { building: def.name() })}>
               {t(L.ApplyToAll, { building: def.name() })}
            </TextWithHelp>
         </div>
         <div className="f1"></div>
         <div
            className="text-link"
            onClick={() => {
               playClick();
               const defaults = gameState.buildingDefaults;
               if (!defaults[building.type]) {
                  defaults[building.type] = {};
               }
               Object.assign(defaults[building.type]!, getOptions(building));
            }}
         >
            <TextWithHelp
               noStyle
               content={t(L.SetAsDefaultBuilding, {
                  building: def.name(),
               })}
            >
               {t(L.SetAsDefault, { building: def.name() })}
            </TextWithHelp>
         </div>
      </div>
   );
}
