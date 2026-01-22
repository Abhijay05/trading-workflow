export type OHLCV = {
  t: number; // unix ms
  close: number;
};

export type MarketSnapshot = {
  symbol: string;
  spot: number;
  ma30: number;
  vol30: number;
  drawdownPct: number;
};

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
}

function stdev(xs: number[]) {
  const m = mean(xs);
  const v = mean(xs.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params?: any;
};

type JsonRpcResponse<T> = {
  jsonrpc: "2.0";
  id: string;
  result?: T;
  error?: { code: number; message: string; data?: any };
};

function mcpBase() {
  return process.env.MCP_URL ?? "https://mcp.crypto.com/market-data/mcp";
}

async function mcpCall<T>(method: string, params?: any): Promise<T> {
  const req: JsonRpcRequest = {
    jsonrpc: "2.0",
    id: `${Date.now()}`,
    method,
    params,
  };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const apiKey = process.env.MCP_API_KEY;
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch(mcpBase(), {
    method: "POST",
    headers,
    body: JSON.stringify(req),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`MCP http ${res.status}: ${txt}`);

  const json = JSON.parse(txt) as JsonRpcResponse<T>;
  if (json.error) throw new Error(`MCP ${json.error.code}: ${json.error.message}`);
  if (json.result === undefined) throw new Error("MCP: missing result");
  return json.result;
}

export async function listMcpTools(): Promise<any> {
  return await mcpCall("tools/list");
}

/**
 * Fetch market snapshot via MCP.
 *
 * NOTE: MCP tool names/params can differ. We try a few common shapes:
 * - tools/call { name, arguments }
 * You can inspect available tools via `listMcpTools()`.
 */
export async function fetchMarketSnapshot(params: {
  symbol: string; // e.g. "CRO_USDC" or "CRO/USDC"
  days?: number;
}): Promise<MarketSnapshot> {
  const days = params.days ?? 30;

  // Try to fetch candles/closes
  const candles = await mcpCall<any>("tools/call", {
    name: process.env.MCP_CANDLES_TOOL ?? "market_data.get_candles",
    arguments: {
      symbol: params.symbol,
      interval: "1d",
      limit: days,
    },
  });

  // Normalize common candle formats:
  // - [{ t, c }] or [{ time, close }] or nested { data: [...] }
  const rows: any[] = Array.isArray(candles) ? candles : candles?.data ?? candles?.result ?? [];
  const closes = rows
    .map((r) => r?.close ?? r?.c ?? r?.C ?? r?.price ?? null)
    .filter((x) => typeof x === "number" && Number.isFinite(x)) as number[];

  if (closes.length < 5) {
    throw new Error(
      `MCP candles returned insufficient data. Set MCP_CANDLES_TOOL to the correct tool name. tools/list=${JSON.stringify(
        await listMcpTools(),
      )}`,
    );
  }

  // Spot price (optional; otherwise use latest close)
  let spot = closes[closes.length - 1]!;
  try {
    const spotRes = await mcpCall<any>("tools/call", {
      name: process.env.MCP_SPOT_TOOL ?? "market_data.get_spot",
      arguments: { symbol: params.symbol },
    });
    const spotCandidate =
      spotRes?.price ?? spotRes?.spot ?? spotRes?.data?.price ?? spotRes?.result?.price;
    if (typeof spotCandidate === "number" && Number.isFinite(spotCandidate)) {
      spot = spotCandidate;
    }
  } catch {
    // keep fallback
  }

  const ma30 = mean(closes);
  const vol30 = stdev(closes);
  const drawdownPct = ((ma30 - spot) / ma30) * 100;

  return { symbol: params.symbol, spot, ma30, vol30, drawdownPct };
}

