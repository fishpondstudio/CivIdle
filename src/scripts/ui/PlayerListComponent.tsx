import { useEffect, useState } from "react";
import { $t, L } from "../../../shared/utilities/i18n";
import { client } from "../rpc/RPCClient";
import { Fonts } from "../visuals/Fonts";
import { MiscTextureComponent } from "./TextureSprites";

export function PlayerListComponent({ type }: { type: "supporters" | "keepers" }): React.ReactNode {
   const [players, setPlayers] = useState<string[]>([]);
   useEffect(() => {
      if (type === "supporters") {
         client.getSupporters(3).then((s) => {
            setPlayers(s);
         });
      } else {
         client.getKeepersOfOurServer(3).then((s) => {
            setPlayers(s);
         });
      }
   }, [type]);
   return (
      <div className="inset-deep white p10 mb10" style={{ position: "relative" }}>
         <MiscTextureComponent
            name={type === "supporters" ? "Supporter" : "Supporter2"}
            style={{ position: "absolute", right: 5, bottom: 5 }}
            scale={0.25}
         />
         <div
            className="text-center text-small text-desc"
            style={{ textTransform: "uppercase", fontFamily: Fonts.Cabin }}
         >
            {$t(type === "supporters" ? L.SupporterThankYou : L.KeeperOfOurServerThankYou)}
         </div>
         <div className="text-center mv5 text-large" style={{ fontFamily: Fonts.Cabin }}>
            {players.join(", ")}
         </div>
      </div>
   );
}
