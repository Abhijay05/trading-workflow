import { Handle, Position } from "@xyflow/react";
import { PriceTriggerMetadata } from "common/types";

export function PriceTrigger({
  data,
  isConnectable,
}: {
  data: {
    metadata: PriceTriggerMetadata;
  };
  isConnectable: boolean;
}) {
  return (
    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg border border-purple-400/30 p-4 min-w-[200px] text-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-xl">📊</div>
        <div className="font-bold text-sm uppercase tracking-wider">
          Price Trigger
        </div>
      </div>
      <div className="space-y-2">
        <div className="bg-purple-900/50 rounded px-3 py-2">
          <div className="text-xs text-purple-200 mb-1">Asset</div>
          <div className="text-lg font-bold font-mono">
            {data.metadata.asset}
          </div>
        </div>
        <div className="bg-purple-900/50 rounded px-3 py-2">
          <div className="text-xs text-purple-200 mb-1">Price Target</div>
          <div className="text-lg font-bold font-mono">
            ${data.metadata.price}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
}
