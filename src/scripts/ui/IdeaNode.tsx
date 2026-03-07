import Tippy from "@tippyjs/react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { getIdeaDesc } from "../../../shared/definitions/IdeaDefinitions";
import type { Upgrade } from "../../../shared/definitions/UpgradeDefinitions";
import { Config } from "../../../shared/logic/Config";

type IdeaNode = Node<{ upgrade: Upgrade }, "IdeaNode">;

export default function IdeaNode({ data }: NodeProps<IdeaNode>) {
   const { upgrade } = data;
   return (
      <Tippy content="Click to unlock">
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
