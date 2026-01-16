export const SUPPORTED_ASSETS = ["SOL", "BTC", "ETH"];

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
  symbol: typeof SUPPORTED_ASSETS;
};
