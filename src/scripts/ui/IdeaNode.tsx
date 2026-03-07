import Tippy from "@tippyjs/react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { getIdeaDesc } from "../../../shared/definitions/IdeaDefinitions";
import type { Upgrade } from "../../../shared/definitions/UpgradeDefinitions";
import { Config } from "../../../shared/logic/Config";
import { useGameState } from "../Global";

type IdeaNode = Node<{ upgrade: Upgrade; requires: Upgrade[] }, "IdeaNode">;

export default function IdeaNode({ data }: NodeProps<IdeaNode>) {
   const { upgrade, requires } = data;
   const gs = useGameState();
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
               <div className="row g15">
                  <div className="f1">Idea Point</div>
                  <div className="m-icon small text-red">cancel</div>
               </div>
            </>
         }
      >
         <div
            className="idea-tree-node pointer"
            onClick={() => {
               console.log("clicked");
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
