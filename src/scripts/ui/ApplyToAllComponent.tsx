import { applyToAllBuildings } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import { type IBuildingData } from "../../../shared/logic/Tile";
import { L, t } from "../../../shared/utilities/i18n";
import { playClick } from "../visuals/Sound";
import { TextWithHelp } from "./TextWithHelpComponent";

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
               const defaults = getGameOptions().buildingDefaults;
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
