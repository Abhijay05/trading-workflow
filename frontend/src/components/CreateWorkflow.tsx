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
import { Hyperliquid } from "@/nodes/actions/Hyperliquid";
import { Lighter } from "@/nodes/actions/Lighter";
import { Backpack } from "@/nodes/actions/Backpack";
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
  hyperliquid: Hyperliquid,
  backpack: Backpack,
  lighter: Lighter,
};

export default function Workflow() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectAction, setSelectAction] = useState<{
    position: {
      x: number;
      y: number;
    };
    startingNodeId: string;
  } | null>(null);
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
  const POSITION_OFFSET = 50;
  const onConnectEnd = useCallback((params, connectionInfo) => {
    // if (!connectionInfo.isValid)
    {
      setSelectAction({
        startingNodeId: connectionInfo.fromNode.id,
        position: {
          x: connectionInfo.from.x + POSITION_OFFSET,
          y: connectionInfo.from.y + POSITION_OFFSET,
        },
      });
    }
  }, []);
  {
    JSON.stringify(selectAction);
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 flex flex-col">
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
      {selectAction && (
        <ActionSheet
          // open={!selectAction}
          // onClose={() => setSelectAction(null)}
          onSelect={(type, metadata) => {
            const NodeId = Math.random().toString();
            setNodes((prev) => [
              ...prev,
              {
                id: NodeId,
                type,
                data: {
                  kind: "action",
                  metadata,
                  label: type,
                },
                position: selectAction.position,
              },
            ]);
            setEdges([
              ...edges,
              {
                id: `${selectAction.startingNodeId}-${NodeId}`,
                source: selectAction.startingNodeId,
                target: NodeId,
              },
            ]);
            setSelectAction(null);
          }}
        ></ActionSheet>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnectEnd={onConnectEnd}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-white/5 backdrop-blur-sm rounded-xl shadow-2xl border border-white/10"
      />
    </div>
  );
}
