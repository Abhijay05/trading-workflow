import { Wallet, TypedDataDomain, randomBytes } from "ethers";

type X402Network = "cronos-testnet" | "cronos-mainnet";

const EIP3009_TYPES = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
};

export async function createPaymentHeaderBase64(args: {
  network: X402Network;
  assetContract: string;
  from: string;
  payTo: string;
  amountBaseUnits: string;
  maxTimeoutSeconds?: number;
}): Promise<string> {
  const privateKey = process.env.X402_SIGNER_KEY;
  if (!privateKey) {
    throw new Error("X402_SIGNER_KEY env var is required for local signing (option B)");
  }

  const chainId = Number(process.env.CRONOS_CHAIN_ID ?? "338"); // Cronos testnet by default

  const domain: TypedDataDomain = {
    name: process.env.X402_TOKEN_NAME ?? "USD Coin",
    version: process.env.X402_TOKEN_VERSION ?? "2",
    chainId,
    verifyingContract: args.assetContract,
  };

  const wallet = new Wallet(privateKey);
  const nowSec = Math.floor(Date.now() / 1000);
  const timeout = args.maxTimeoutSeconds ?? 300;
  const validAfter = 0;
  const validBefore = nowSec + timeout;
  const nonce = "0x" + Buffer.from(randomBytes(32)).toString("hex");

  const message = {
    from: args.from,
    to: args.payTo,
    value: args.amountBaseUnits,
    validAfter,
    validBefore,
    nonce,
  };

  const signature = await wallet.signTypedData(
    domain,
    EIP3009_TYPES as any,
    message as any,
  );

  const header = {
    x402Version: 1,
    scheme: "exact",
    network: args.network,
    payload: {
      ...message,
      signature,
      asset: args.assetContract,
    },
  };

  const json = JSON.stringify(header);
  return Buffer.from(json, "utf8").toString("base64");
}

