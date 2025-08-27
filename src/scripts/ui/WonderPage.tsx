import type { Building } from "../../../shared/definitions/BuildingDefinitions";
import { isWorldWonder } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { getXyBuildings } from "../../../shared/logic/IntraTickCache";
import { Tick } from "../../../shared/logic/TickLogic";
import { cls, keysOf } from "../../../shared/utilities/Helper";
import type { PartialSet } from "../../../shared/utilities/TypeDefinitions";
import { L, t } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { Singleton } from "../utilities/Singleton";
import { MenuComponent } from "./MenuComponent";
import { BuildingSpriteComponent } from "./TextureSprites";
import { TilePage } from "./TilePage";
import { TitleBarComponent } from "./TitleBarComponent";

export function WonderPage(): React.ReactNode {
   const gs = useGameState();
   const builtWonders: PartialSet<Building> = {};
   getXyBuildings(gs).forEach((building) => {
      if (Config.Building[building.type].max === 1 && Config.Building[building.type].construction) {
         builtWonders[building.type] = true;
      }
   });
   return (
      <div className="window">
         <TitleBarComponent>{t(L.Wonder)}</TitleBarComponent>
         <MenuComponent />
         <div className="window-body" style={{ display: "flex", flexDirection: "column" }}>
            <div className="mb10">
               <button
                  className="w100 row jcc"
                  onClick={() =>
                     Singleton().routeTo(TilePage, {
                        xy: Tick.current.specialBuildings.get("Headquarter")?.tile,
                     })
                  }
               >
                  <div className="m-icon" style={{ margin: "0 5px 0 -5px", fontSize: "18px" }}>
                     arrow_back
                  </div>
                  <div className="f1">{t(L.GoBack)}</div>
               </button>
            </div>
            <div className="table-view sticky-header f1">
               <table>
                  <thead>
                     <tr>
                        <th>{t(L.GreatPeopleName)}</th>
                        <th>{t(L.GreatPeopleEffect)}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {keysOf(Config.Building)
                        .filter((b) => isWorldWonder(b))
                        .sort((a, b) => Config.Building[a].name().localeCompare(Config.Building[b].name()))
                        .map((b) => {
                           const def = Config.Building[b];
                           return (
                              <tr key={b}>
                                 <td>
                                    <div>
                                       <BuildingSpriteComponent
                                          building={b}
                                          scale={0.5}
                                          style={{
                                             filter: builtWonders[b] ? "invert(0.75)" : "invert(0.25)",
                                          }}
                                       />
                                       <div className={cls(builtWonders[b] ? "text-strong" : "text-desc")}>
                                          {def.name()}
                                       </div>
                                    </div>
                                 </td>
                                 <td>{def.desc?.()}</td>
                              </tr>
                           );
                        })}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
