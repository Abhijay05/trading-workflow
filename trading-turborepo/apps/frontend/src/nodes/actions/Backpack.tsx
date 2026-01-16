import { SUPPORTED_ASSETS } from "../../../../../packages/common/metadata";
import type { TradingMetadata } from "../../../../../packages/common/metadata";
import { Handle, Position } from "@xyflow/react";
export function Backpack({
  data,
}: {
  data: {
    metadata: TradingMetadata;
  };
}) {
  const isLong = data.metadata.type === "LONG";
  return (
    <div
      className={`bg-gradient-to-br ${
        isLong ? "from-green-500 to-green-600" : "from-red-500 to-red-600"
      } rounded-lg shadow-lg border ${
        isLong ? "border-green-400/30" : "border-red-400/30"
      } p-4 min-w-[200px] text-white`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="text-xl">🎒</div>
        <div className="font-bold text-sm uppercase tracking-wider">
          Backpack
        </div>
      </div>
      <div className="space-y-2">
        <div
          className={`${
            isLong ? "bg-green-900/50" : "bg-red-900/50"
          } rounded px-3 py-2`}
        >
          <div className="text-xs opacity-75 mb-1">Position</div>
          <div className="text-lg font-bold">{data.metadata.type}</div>
        </div>
        <div
          className={`${
            isLong ? "bg-green-900/50" : "bg-red-900/50"
          } rounded px-3 py-2`}
        >
          <div className="text-xs opacity-75 mb-1">Quantity</div>
          <div className="text-lg font-bold font-mono">{data.metadata.qty}</div>
        </div>
        <div
          className={`${
            isLong ? "bg-green-900/50" : "bg-red-900/50"
          } rounded px-3 py-2`}
        >
          <div className="text-xs opacity-75 mb-1">Symbol</div>
          <div className="text-lg font-bold font-mono">
            {data.metadata.symbol}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
