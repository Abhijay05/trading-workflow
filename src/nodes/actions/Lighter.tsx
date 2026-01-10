import { SUPPORTED_ASSETS } from "@/components/TriggerSheet";
export type TradingMetadata = {
  type: "LONG" | "SHORT";
  qty: number;
  symbol: typeof SUPPORTED_ASSETS;
};

export function Lighter({
  data,
}: {
  data: {
    metadata: TradingMetadata;
  };
}) {
  return (
    <div className="p4-border">
      Lighter Trade
      <div>{data.metadata.type}</div>
      <div>{data.metadata.qty}</div>
      <div>{data.metadata.symbol}</div>
    </div>
  );
}
