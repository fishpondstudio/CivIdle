import dagre from "@dagrejs/dagre";
import {
   Controls,
   getViewportForBounds,
   Panel,
   Position,
   ReactFlow,
   SmoothStepEdge,
   useReactFlow,
   type Edge,
   type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import { CarthaginianIdeas, type IdeaDefinition } from "../../../shared/definitions/IdeaDefinitions";
import { entriesOf } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { hideModal } from "./GlobalModal";
import { IdeaNode } from "./IdeaNode";
import "./IdeaTreeModal.css";

const nodeWidth = 200;
const nodeHeight = 70;

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

function getLayoutElements({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
   dagreGraph.setGraph({ rankdir: "TB" });

   nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
   });

   edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
   });

   dagre.layout(dagreGraph);

   const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const newNode: Node = {
         ...node,
         sourcePosition: Position.Bottom,
         targetPosition: Position.Top,
         // We are shifting the dagre node position (anchor=center center) to the top left
         // so it matches the React Flow node anchor point (top left).
         position: {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
         },
      };

      return newNode;
   });

   return { nodes: newNodes, edges };
}

function getNodesAndEdges<K extends string, V>(
   ideas: Record<K, IdeaDefinition<V>>,
): { nodes: Node[]; edges: Edge[] } {
   const nodes: Node[] = [];
   const edges: Edge[] = [];
   const dict = entriesOf(ideas).reverse();
   for (const [key, idea] of dict) {
      nodes.push({
         id: key,
         position: { x: 0, y: 0 },
         data: { upgrade: idea.upgrade, requires: idea.requires },
         type: "IdeaNode",
      });
      idea.requires.forEach((parent) => {
         edges.push({
            id: `${key}-${parent}`,
            source: parent as string,
            target: key,
         });
      });
   }
   return { nodes, edges };
}

const { nodes, edges } = getLayoutElements(getNodesAndEdges(CarthaginianIdeas));

const imageWidth = 2500 * 2;
const imageHeight = 1000 * 2;

export function IdeaTreeModal(): React.ReactNode {
   return (
      <div className="window" style={{ width: "unset" }}>
         <div className="title-bar">
            <div className="title-bar-text">{$t(L.CivilizationIdeas)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            <div
               className="inset-shallow white"
               style={{ width: "1024px", height: "768px", maxWidth: "90vw", maxHeight: "90vh" }}
            >
               <ReactFlow
                  zoomOnDoubleClick={false}
                  nodesConnectable={false}
                  nodesDraggable={false}
                  nodesFocusable={false}
                  edgesFocusable={false}
                  nodeTypes={{ IdeaNode }}
                  nodes={nodes}
                  edges={edges}
                  edgeTypes={{ default: SmoothStepEdge }}
                  proOptions={{ hideAttribution: true }}
                  fitView
               >
                  <Controls showInteractive={false} showZoom={false} showFitView={true} />
                  {/* <DownloadButton /> */}
               </ReactFlow>
            </div>
         </div>
      </div>
   );
}

function DownloadButton() {
   const { getNodes, getNodesBounds } = useReactFlow();
   return (
      <Panel>
         <button
            onClick={() => {
               const nodesBounds = getNodesBounds(getNodes());
               const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 2, 10, 100);
               toPng(document.querySelector(".react-flow__viewport") as HTMLElement, {
                  backgroundColor: "#ffffff",
                  width: imageWidth,
                  height: imageHeight,
                  style: {
                     width: `${imageWidth}px`,
                     height: `${imageHeight}px`,
                     transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                  },
               }).then((dataUrl) => {
                  const a = document.createElement("a");
                  a.setAttribute("download", "reactflow.png");
                  a.setAttribute("href", dataUrl);
                  a.click();
               });
            }}
         >
            Download
         </button>
      </Panel>
   );
}
