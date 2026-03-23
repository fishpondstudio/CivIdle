import Tippy from "@tippyjs/react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { CarthaginianIdeas, getIdeaDesc } from "../../../shared/definitions/IdeaDefinitions";
import type { Upgrade } from "../../../shared/definitions/UpgradeDefinitions";
import { getCarthageCivilizationIdeas } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { cls, forEach } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { useGameState } from "../Global";
import { isSteam, SteamClient } from "../rpc/SteamClient";
import { playError, playUpgrade } from "../visuals/Sound";

type IdeaNode = Node<{ upgrade: Upgrade; requires: Upgrade[] }, "IdeaNode">;

export function IdeaNode({ data }: NodeProps<IdeaNode>) {
   const { upgrade, requires } = data;
   const gs = useGameState();
   const { total, used } = getCarthageCivilizationIdeas(gs);
   const available = total - used;
   const canUnlock = requires.every((u) => gs.unlockedUpgrades[u]) && available > 0;
   return (
      <Tippy
         disabled={gs.unlockedUpgrades[upgrade]}
         content={
            <>
               {requires.map((u) => {
                  return (
                     <div className="row g15" key={u}>
                        <div className="f1">{Config.Upgrade[u].name()}</div>
                        {gs.unlockedUpgrades[u] ? (
                           <div className="m-icon small text-green">check_circle</div>
                        ) : (
                           <div className="m-icon small text-red">cancel</div>
                        )}
                     </div>
                  );
               })}
               <div className="row g20">
                  <div className="f1">{$t(L.OneIdeaPoint)}</div>
                  {available > 0 ? (
                     <div className="m-icon small text-green">check_circle</div>
                  ) : (
                     <div className="m-icon small text-red">cancel</div>
                  )}
               </div>
               {canUnlock && !gs.unlockedUpgrades[upgrade] && (
                  <div className="mt5 text-strong">{$t(L.ClickToUnlockThisIdea)}</div>
               )}
            </>
         }
      >
         <div
            className={cls(
               "idea-tree-node",
               gs.unlockedUpgrades[upgrade] ? "unlocked" : "",
               canUnlock && !gs.unlockedUpgrades[upgrade] ? "unlockable" : "",
            )}
            onClick={() => {
               if (canUnlock && !gs.unlockedUpgrades[upgrade]) {
                  Config.Upgrade[upgrade].onUnlocked?.(gs);
                  gs.unlockedUpgrades[upgrade] = true;
                  checkAchievement(gs);
                  playUpgrade();
                  notifyGameStateUpdate();
               } else {
                  playError();
               }
            }}
         >
            <div className="idea-tree-node-title">{Config.Upgrade[upgrade].name()}</div>
            <div className="idea-tree-node-desc">{getIdeaDesc(upgrade)}</div>
            <Handle
               className="idea-tree-node-handle"
               type="source"
               position={Position.Bottom}
               isConnectable={false}
            />
            <Handle
               className="idea-tree-node-handle"
               type="target"
               position={Position.Top}
               isConnectable={false}
            />
         </div>
      </Tippy>
   );
}

function checkAchievement(gs: GameState) {
   let allIdeasUnlocked = false;
   forEach(CarthaginianIdeas, (idea, def) => {
      if (!gs.unlockedUpgrades[def.upgrade]) {
         allIdeasUnlocked = false;
         return;
      }
   });
   if (allIdeasUnlocked && isSteam()) {
      SteamClient.unlockAchievement("AFullCothon");
   }
}
