import Tippy from "@tippyjs/react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { IdeaConfig } from "../../../shared/definitions/IdeaDefinitions";

type IdeaNode = Node<{ idea: string; definition: IdeaConfig }, "IdeaNode">;

export default function IdeaNode({ data }: NodeProps<IdeaNode>) {
   const { idea, definition } = data;
   return (
      <Tippy content="Click to unlock">
         <div
            className="idea-tree-node pointer"
            onClick={() => {
               console.log("clicked");
            }}
         >
            <div className="idea-tree-node-title">{definition.name()}</div>
            <div className="idea-tree-node-desc">{definition.desc()}</div>
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
