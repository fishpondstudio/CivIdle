import Tippy from "@tippyjs/react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { getIdeaDesc } from "../../../shared/definitions/IdeaDefinitions";
import type { Upgrade } from "../../../shared/definitions/UpgradeDefinitions";
import { getCarthageCivilizationIdeas } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { cls } from "../../../shared/utilities/Helper";
import { useGameState } from "../Global";
import { playClick, playError } from "../visuals/Sound";

type IdeaNode = Node<{ upgrade: Upgrade; requires: Upgrade[] }, "IdeaNode">;

export function IdeaNode({ data }: NodeProps<IdeaNode>) {
   const { upgrade, requires } = data;
   const gs = useGameState();
   const { total, used } = getCarthageCivilizationIdeas(gs);
   const available = total - used;
   const canUnlock = requires.every((u) => gs.unlockedUpgrades[u]) && available > 0;
   return (
      <Tippy
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
                  <div className="f1">1 Idea Point</div>
                  {available > 0 ? (
                     <div className="m-icon small text-green">check_circle</div>
                  ) : (
                     <div className="m-icon small text-red">cancel</div>
                  )}
               </div>
               {canUnlock && <div className="mt5 text-strong">Click to unlock this idea</div>}
            </>
         }
      >
         <div
            className={cls("idea-tree-node pointer", gs.unlockedUpgrades[upgrade] ? "unlocked" : "")}
            onClick={() => {
               if (canUnlock) {
                  playClick();
                  gs.unlockedUpgrades[upgrade] = true;
                  console.log(gs.unlockedUpgrades);
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
