import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerSheet } from "./TriggerSheet";
import { PriceTrigger } from "@/nodes/triggers/PriceTrigger";
import {
  type PriceTriggerMetadata,
  type TimerNodeMetadata,
  type TradingMetadata,
} from "../../../../packages/common/metadata";
import { Timer } from "@/nodes/triggers/Timer";
import { ActionSheet } from "./ActionSheet";
import { Swap } from "@/nodes/actions/Swap";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
export type NodeKind =
  | "price-trigger"
  | "timer-trigger"
  | "swap";
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
type Execution = {
  _id: string;
  status: string;
  decision?: "BUY" | "HEDGE" | "IDLE";
  txHash?: string;
  startTime?: string;
  market?: {
    spot?: number;
    ma30?: number;
    vol30?: number;
    drawdownPct?: number;
  };
};
const nodeTypes = {
  "price-trigger": PriceTrigger,
  "timer-trigger": Timer,
  swap: Swap,
};

export default function Workflow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  
  const [workflowName, setWorkflowName] = useState("");
  const [strategy, setStrategy] = useState<"smart" | "normal">("normal");
  const [dipThresholdPct, setDipThresholdPct] = useState(7);
  const [volThresholdPct, setVolThresholdPct] = useState(20);
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflowId, setWorkflowId] = useState<string | null>(editId);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loadingExecs, setLoadingExecs] = useState(false);
  const [priceData, setPriceData] = useState<Record<string, number>>({});
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

  const apiBase = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
  const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { authorization: token } : {};
  };

  const loadWorkflow = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${apiBase}/workflow/${id}`, {
        headers: { ...authHeader() },
      });
      if (!res.ok) return;
      const json = await res.json();
      const wf = json.workflow;
      if (wf) {
        setWorkflowName(wf.name ?? "");
        setStrategy(wf.strategy ?? "normal");
        setDipThresholdPct(wf.dipThresholdPct ?? 7);
        setVolThresholdPct(wf.volThresholdPct ?? 20);
        setNodes(wf.nodes ?? []);
        setEdges(wf.edges ?? []);
      }
    } catch (e) {
      console.error("loadWorkflow error", e);
    }
  }, [apiBase]);

  useEffect(() => {
    if (editId) {
      loadWorkflow(editId);
    }
  }, [editId, loadWorkflow]);

  const saveWorkflow = useCallback(async () => {
    if (!nodes.length) {
      alert("Please add at least one trigger node");
      return null;
    }
    try {
      const method = workflowId ? "PUT" : "POST";
      const url = workflowId ? `${apiBase}/workflow/${workflowId}` : `${apiBase}/workflow`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({
          name: workflowName || "Untitled Workflow",
          strategy,
          dipThresholdPct: strategy === "smart" ? dipThresholdPct : undefined,
          volThresholdPct: strategy === "smart" ? volThresholdPct : undefined,
          nodes,
          edges,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Save failed:", res.status, errorText);
        alert(`Failed to save workflow: ${res.status === 403 ? "Not authenticated. Please sign in." : errorText}`);
        return null;
      }
      const json = await res.json();
      const id = json.id ?? workflowId;
      setWorkflowId(id);
      alert("Workflow saved successfully!");
      return id as string;
    } catch (e: any) {
      console.error("saveWorkflow error", e);
      alert(`Failed to save workflow. Is the backend running at ${apiBase}? Error: ${e.message}`);
      return null;
    }
  }, [apiBase, nodes, edges, workflowName, strategy, dipThresholdPct, volThresholdPct, workflowId]);

  const loadExecutions = useCallback(
    async (id: string) => {
      setLoadingExecs(true);
      try {
        const res = await fetch(`${apiBase}/workflow/${id}/executions`, {
          headers: { ...authHeader() },
        });
        if (!res.ok) return;
        const json = await res.json();
        setExecutions(json.executions ?? []);
      } catch (e) {
        console.error("loadExecutions error", e);
      } finally {
        setLoadingExecs(false);
      }
    },
    [apiBase],
  );

  const runNow = useCallback(async () => {
    const id = workflowId ?? (await saveWorkflow());
    if (!id) {
      alert("Please save the workflow first");
      return;
    }
    try {
      setLoadingExecs(true);
      const res = await fetch(`${apiBase}/workflow/${id}/run`, {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorText = await res.text();
        alert(`Failed to run workflow: ${errorText}`);
        return;
      }
      const json = await res.json();
      // Immediately refresh executions to show the new result
      await loadExecutions(id);
      if (json.execution) {
        // Show success message with tx hash if available
        if (json.execution.txHash) {
          alert(`Workflow executed! Transaction: ${json.execution.txHash.substring(0, 10)}...`);
        } else {
          alert(`Workflow executed! Decision: ${json.execution.decision || "IDLE"}`);
        }
      }
    } catch (e: any) {
      console.error("runNow error", e);
      alert(`Failed to run workflow: ${e.message}`);
    } finally {
      setLoadingExecs(false);
    }
  }, [apiBase, workflowId, saveWorkflow, loadExecutions]);

  useEffect(() => {
    if (workflowId) {
      loadExecutions(workflowId);
    }
  }, [workflowId, loadExecutions]);

  // Poll prices for price triggers
  useEffect(() => {
    const priceTriggers = nodes.filter((n) => n.type === "price-trigger");
    if (priceTriggers.length === 0) return;

    const pollPrices = async () => {
      for (const node of priceTriggers) {
        const meta = node.data.metadata as PriceTriggerMetadata;
        if (meta?.asset) {
          try {
            const res = await fetch(`${apiBase}/price/${meta.asset}`);
            if (res.ok) {
              const json = await res.json();
              setPriceData((prev) => ({ ...prev, [meta.asset]: json.price }));
            }
          } catch (e) {
            console.error(`Error fetching price for ${meta.asset}:`, e);
          }
        }
      }
    };

    pollPrices();
    const interval = setInterval(pollPrices, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [nodes, apiBase]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center gap-3 text-white/90 flex-wrap">
        <Button
          variant="outline"
          className="bg-white/10 border-white/15 text-white hover:bg-white/15"
          onClick={() => navigate("/workflows")}
        >
          ← Back to Workflows
        </Button>
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Workflow Name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-white/10 border-white/15 text-white placeholder:text-white/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-white/90">Strategy:</Label>
          <Select value={strategy} onValueChange={(v: "smart" | "normal") => setStrategy(v)}>
            <SelectTrigger className="w-[120px] bg-white/10 border-white/15 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="smart">Smart</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {strategy === "smart" && (
          <>
            <div className="flex items-center gap-2">
              <Label className="text-white/90 text-xs">Dip %:</Label>
              <Input
                type="number"
                value={dipThresholdPct}
                onChange={(e) => setDipThresholdPct(Number(e.target.value))}
                className="w-20 bg-white/10 border-white/15 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-white/90 text-xs">Vol %:</Label>
              <Input
                type="number"
                value={volThresholdPct}
                onChange={(e) => setVolThresholdPct(Number(e.target.value))}
                className="w-20 bg-white/10 border-white/15 text-white"
              />
            </div>
          </>
        )}
        <Button
          variant="outline"
          className="bg-white/10 border-white/15 text-white hover:bg-white/15"
          onClick={saveWorkflow}
          disabled={!nodes.length}
        >
          {workflowId ? "Update" : "Save"} Workflow
        </Button>
        <Button
          className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25"
          onClick={runNow}
          disabled={!nodes.length}
        >
          Run Now
        </Button>
      </div>

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

      <div className="flex-1 min-h-0 flex gap-4">
        <div className="flex-1 min-h-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onConnectEnd={onConnectEnd}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="bg-white/5 backdrop-blur-sm rounded-xl shadow-2xl border border-white/10 h-full"
          />
        </div>
        
        {/* Real-time price display */}
        {nodes.some((n) => n.type === "price-trigger") && (
          <div className="w-64 bg-white/5 backdrop-blur rounded-xl border border-white/10 p-4 text-white/90">
            <h3 className="font-semibold mb-3">Live Prices</h3>
            {nodes
              .filter((n) => n.type === "price-trigger")
              .map((n) => {
                const meta = n.data.metadata as PriceTriggerMetadata;
                const currentPrice = priceData[meta.asset] ?? meta.price;
                const isAbove = currentPrice >= meta.price;
                return (
                  <div key={n.id} className="mb-3 p-2 bg-white/5 rounded">
                    <div className="text-xs text-white/60">{meta.asset}</div>
                    <div className={`text-lg font-bold ${isAbove ? "text-green-400" : "text-red-400"}`}>
                      ${currentPrice.toFixed(4)}
                    </div>
                    <div className="text-xs text-white/60">Target: ${meta.price}</div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-4 text-white/90 max-h-48 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Execution History</h3>
          {loadingExecs && <span className="text-xs text-white/60">Loading…</span>}
        </div>
        {!executions.length && (
          <p className="text-sm text-white/60">No runs yet. Hit “Run Now”.</p>
        )}
        {executions.map((exec) => (
          <div
            key={exec._id}
            className="border border-white/10 rounded-lg p-3 mb-2 bg-white/5"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{exec.decision ?? "IDLE"}</span>
              <span className="text-white/60">
                {exec.startTime
                  ? new Date(exec.startTime).toLocaleString()
                  : ""}
              </span>
            </div>
            <div className="text-xs text-white/70 mt-1">
              {exec.market ? (
                <>
                  <div>Spot: {exec.market.spot?.toFixed?.(2)}</div>
                  <div>MA30: {exec.market.ma30?.toFixed?.(2)}</div>
                  <div>Vol30: {exec.market.vol30?.toFixed?.(2)}</div>
                  <div>
                    Drawdown: {exec.market.drawdownPct?.toFixed?.(2)}%
                  </div>
                </>
              ) : (
                <div>No market snapshot</div>
              )}
              {exec.txHash && <div className="mt-1">Tx: {exec.txHash}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
