import { Handle, Position } from "@xyflow/react";
export type TimerNodeMetadata = {
  time: number;
};
export function Timer({
  data,
  isConnectable,
}: {
  data: {
    metadata: TimerNodeMetadata;
  };
  isConnectable: boolean;
}) {
  const hours = Math.floor(data.metadata.time / 3600);
  const minutes = Math.floor((data.metadata.time % 3600) / 60);
  const seconds = data.metadata.time % 60;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg border border-blue-400/30 p-4 min-w-[200px] text-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-xl">⏱️</div>
        <div className="font-bold text-sm uppercase tracking-wider">
          Timer Trigger
        </div>
      </div>
      <div className="bg-blue-900/50 rounded px-3 py-2 text-center">
        <div className="text-2xl font-bold font-mono">
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </div>
        <div className="text-xs text-blue-200 mt-1">{data.metadata.time}s</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
}
