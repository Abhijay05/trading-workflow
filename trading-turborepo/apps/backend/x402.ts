type X402Network = "cronos-testnet" | "cronos-mainnet";

export type X402PaymentRequirements = {
  scheme: "exact";
  network: X402Network;
  payTo: string; // 0x...
  asset: string; // token contract (e.g. USDC.e)
  maxAmountRequired: string; // integer string (token base units)
  maxTimeoutSeconds: number;
};

export type X402VerifyRequest = {
  x402Version: 1;
  paymentHeader: string; // base64
  paymentRequirements: X402PaymentRequirements;
};

export type X402VerifyResponse = {
  isValid: boolean;
  invalidReason: string | null;
};

export type X402SettleSuccess = {
  x402Version: 1;
  event: "payment.settled";
  txHash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  network: X402Network;
  timestamp: string;
};

export type X402SettleFailure = {
  x402Version: 1;
  event: "payment.failed";
  network: X402Network;
  timestamp: string;
  error: string;
};

export type X402SettleResponse = X402SettleSuccess | X402SettleFailure;

function facilitatorBase() {
  return process.env.X402_FACILITATOR_BASE ?? "https://facilitator.cronoslabs.org";
}

async function postJson<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X402-Version": "1",
    },
    body: JSON.stringify(body),
  });
  const txt = await res.text();
  if (!res.ok) {
    throw new Error(`x402 http ${res.status}: ${txt}`);
  }
  return JSON.parse(txt) as T;
}

/**
 * Verifies a base64 payment header + requirements (no on-chain tx).
 */
export async function verifyPayment(req: X402VerifyRequest): Promise<X402VerifyResponse> {
  return await postJson<X402VerifyResponse>(`${facilitatorBase()}/v2/x402/verify`, req);
}

/**
 * Settles a base64 payment header + requirements on-chain via facilitator.
 */
export async function settlePayment(req: X402VerifyRequest): Promise<X402SettleResponse> {
  return await postJson<X402SettleResponse>(`${facilitatorBase()}/v2/x402/settle`, req);
}

export type SwapRequest = {
  // For now this “swap” is represented as an x402 USDC.e payment to a payTo address.
  // The receiving service can perform the actual on-chain swap and/or return a swap tx separately.
  network: X402Network;
  fromAsset: string; // symbolic (USDC/CRO) for logs
  toAsset: string; // symbolic (USDC/CRO) for logs
  amountInBaseUnits: string; // integer string in token base units (e.g. USDC.e 6 decimals)
  payTo: string; // recipient address
  assetContract: string; // USDC.e contract address
  paymentHeaderBase64: string; // signed EIP-3009 authorization header, base64
};

export type SwapResult = {
  txHash: string;
};

/**
 * Real x402 flow (verify -> settle). Requires a pre-signed `paymentHeaderBase64`.
 */
export async function executeSwap(req: SwapRequest): Promise<SwapResult> {
  const verifyReq: X402VerifyRequest = {
    x402Version: 1,
    paymentHeader: req.paymentHeaderBase64,
    paymentRequirements: {
      scheme: "exact",
      network: req.network,
      payTo: req.payTo,
      asset: req.assetContract,
      maxAmountRequired: req.amountInBaseUnits,
      maxTimeoutSeconds: 300,
    },
  };

  const v = await verifyPayment(verifyReq);
  if (!v.isValid) {
    throw new Error(`x402 verify failed: ${v.invalidReason ?? "unknown"}`);
  }

  const settled = await settlePayment(verifyReq);
  if (settled.event !== "payment.settled") {
    throw new Error(`x402 settle failed: ${settled.error}`);
  }

  return { txHash: settled.txHash };
}

