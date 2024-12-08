import { useEffect, useState } from "react";
import { L, t } from "../../../shared/utilities/i18n";
import { client } from "../rpc/RPCClient";
import { Fonts } from "../visuals/Fonts";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";

export function HagiaSophiaBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }
   const [supporters, setSupporters] = useState<string[]>([]);
   useEffect(() => {
      client.getSupporters(3).then((s) => {
         setSupporters(s);
      });
   }, []);
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset className="text-center">
            <div className="text-small text-desc" style={{ textTransform: "uppercase" }}>
               {t(L.SupporterThankYou)}
            </div>
            <div style={{ fontFamily: Fonts.OldTypefaces, fontSize: 22, margin: "10px 0" }}>
               {supporters.join(", ")}
            </div>
         </fieldset>
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
