import { Handle, Position } from "@xyflow/react";

export type PriceTriggerMetadata = {
  asset: string;
  price: number;
};

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
    <div className="p-4 border">
      {data.metadata.asset}
      {data.metadata.price}
      <Handle type="source" position={Position.Right}></Handle>
    </div>
  );
}
