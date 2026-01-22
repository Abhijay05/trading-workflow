export const SUPPORTED_ASSETS = ["CRO", "USDC"] as const;

export type PriceTriggerMetadata = {
  asset: string;
  price: number;
};

export type TimerNodeMetadata = {
  time: number;
};

export type TradingMetadata = {
  type: "LONG" | "SHORT";
  qty: number;
  symbol: string; // CRO or USDC
};

export type WorkflowStrategy = "smart" | "normal"; // smart = dip/vol strategy, normal = direct triggers

export type WorkflowMetadata = {
  name?: string;
  strategy?: WorkflowStrategy;
  dipThresholdPct?: number; // for smart strategy
  volThresholdPct?: number; // for smart strategy
};
