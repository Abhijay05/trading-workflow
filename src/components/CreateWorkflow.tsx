import { useState, useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerSheet } from "./TriggerSheet";
import {
  PriceTrigger,
  type PriceTriggerMetadata,
} from "@/nodes/triggers/PriceTrigger";
import { Timer, type TimerNodeMetadata } from "@/nodes/triggers/Timer";
import type { TradingMetadata } from "@/nodes/actions/Lighter";
import { ActionSheet } from "./ActionSheet";

export type NodeKind =
  | "price-trigger"
  | "timer-trigger"
  | "hyperliquid"
  | "backpack"
  | "lighter";
export type NodeMetadata =
  | TradingMetadata
  | TimerNodeMetadata
  | PriceTriggerMetadata;

interface NodeType {
  type: NodeKind;
  data: {
    kind: "action" | "trigger";
    metadata: NodeMetadata;
    label: string;
  };
  id: string;
  position: { x: number; y: number };
}
interface Edge {
  id: string;
  source: string;
  target: string;
}
const nodeTypes = {
  "price-trigger": PriceTrigger,
  "timer-trigger": Timer,
};

export default function Workflow() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );
  const onConnectEnd = useCallback(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `Node ${id}` },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, source: connectionState.fromNode.id, target: id })
        );
      }
    },
    [screenToFlowPosition]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {!nodes.length && (
        <TriggerSheet
          onSelect={(type, metadata) => {
            setNodes((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                type,
                data: {
                  kind: "trigger",
                  metadata,
                  label: type,
                },
                position: { x: 0, y: 0 },
              },
            ]);
          }}
        />
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}
