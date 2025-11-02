import Tippy from "@tippyjs/react";
import { hasRequiredDeposit } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { sizeOf } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { jsxMapOf } from "../utilities/Helper";
import type { IBuildingComponentProps } from "./BuildingPage";
import { DepositTextureComponent } from "./TextureSprites";

export function BuildingDepositComponent({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const tile = gameState.tiles.get(xy);
   if (!tile) {
      return null;
   }
   const building = tile.building;
   if (!building) {
      return null;
   }
   const deposits = Config.Building[building.type].deposit;
   if (!deposits || sizeOf(deposits) === 0) {
      return null;
   }
   return (
      <fieldset>
         <legend>{t(L.RequiredDeposit)}</legend>
         <ul className="tree-view">
            {jsxMapOf(deposits, (k) => {
               return (
                  <li key={k} className="row">
                     <DepositTextureComponent
                        deposit={k}
                        style={{ filter: "invert(0.75)", marginRight: 5 }}
                        scale={0.2}
                     />
                     {hasRequiredDeposit({ [k]: true }, xy, gameState) ? (
                        <>
                           <div className="f1">{Config.Material[k].name()}</div>
                           <div className="m-icon small text-green">check_circle</div>
                        </>
                     ) : (
                        <>
                           <Tippy content={t(L.NotOnDeposit, { deposit: Config.Material[k].name() })}>
                              <div className="f1 text-red text-strong">{Config.Material[k].name()}</div>
                           </Tippy>

                           <div className="m-icon small text-red">cancel</div>
                        </>
                     )}
                  </li>
               );
            })}
         </ul>
      </fieldset>
   );
}
