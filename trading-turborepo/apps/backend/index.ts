import "dotenv/config";
import { ExecutionModel, UserModel, WorkflowModel } from "db";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { SignupSchema, SigninSchema, CreateWorkflowSchema } from "packages/common/types";
import { authMiddleware } from "./middleware";
import { fetchMarketSnapshot } from "./mcp";
import { executeSwap } from "./x402";
import { createPaymentHeaderBase64 } from "./x402_signer";
import cors from "cors";
mongoose.connect(process.env.MONGO_URL!);
const JWT_SECRET = process.env.JWT_SECRET!;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
console.log("MONGO_URL =", process.env.MONGO_URL);

function getTriggerNode(nodes: any[]) {
  return nodes.find((n) => n?.data?.kind === "trigger" || n?.data?.data?.kind === "TRIGGER");
}

function getTimerSeconds(triggerNode: any): number | null {
  const meta = triggerNode?.data?.metadata ?? triggerNode?.data?.data?.metadata;
  const t = meta?.time;
  return typeof t === "number" && Number.isFinite(t) ? t : null;
}

function getPriceTrigger(triggerNode: any): { asset: string; price: number } | null {
  if (triggerNode?.type !== "price-trigger") return null;
  const meta = triggerNode?.data?.metadata ?? triggerNode?.data?.data?.metadata;
  if (meta?.asset && typeof meta?.price === "number") {
    return { asset: meta.asset, price: meta.price };
  }
  return null;
}

function getActionNodes(nodes: any[]) {
  return nodes.filter((n) => n?.data?.kind === "action" || n?.data?.data?.kind === "ACTION");
}

async function runWorkflowOnce(workflow: any) {
  const triggerNode = getTriggerNode(workflow.nodes ?? []);
  const triggerNodeId = triggerNode?.id;
  const actionNodes = getActionNodes(workflow.nodes ?? []);

  const exec = await ExecutionModel.create({
    workflowId: workflow._id,
    triggerNodeId,
    status: "PENDING",
    decision: "IDLE",
    market: {},
  });

  try {
    const strategy = workflow.strategy ?? "normal";
    let decision: "BUY" | "HEDGE" | "IDLE" = "IDLE";
    let txHash: string | undefined;
    let market: any = {};

    // For price triggers, check if price crossed threshold
    const priceTrigger = getPriceTrigger(triggerNode);
    if (priceTrigger) {
      market = await fetchMarketSnapshot({ symbol: `${priceTrigger.asset}/USDC`, days: 30 });
      const currentPrice = market.spot;
      if (currentPrice >= priceTrigger.price) {
        decision = "BUY"; // Price crossed threshold, execute actions
      } else {
        decision = "IDLE";
      }
    } else if (strategy === "smart") {
      // Smart strategy: dip/volatility based
      market = await fetchMarketSnapshot({ symbol: process.env.MCP_SYMBOL ?? "CRO/USDC", days: 30 });
      const dipThresholdPct = workflow.dipThresholdPct ?? 7;
      const volThresholdPct = workflow.volThresholdPct ?? 20;
      const volSpike = market.vol30 > market.ma30 * (volThresholdPct / 100);

      if (market.drawdownPct > dipThresholdPct) {
        decision = "BUY";
      } else if (volSpike) {
        decision = "HEDGE";
      }
    } else {
      // Normal strategy: timer triggers just execute actions
      decision = "BUY"; // Execute actions on timer
    }

    // Execute actions if decision is not IDLE
    if (decision !== "IDLE" && actionNodes.length > 0) {
      // Execute first action node (swap)
      const actionNode = actionNodes[0];
      const actionMeta = actionNode?.data?.metadata ?? actionNode?.data?.data?.metadata;
      
      // Only execute swap actions
      if (actionNode?.type === "swap" && actionMeta?.type && actionMeta?.qty) {
        // Determine swap direction based on action metadata or decision
        const isLong = actionMeta.type === "LONG";
        const fromAsset = (decision === "BUY" || isLong) ? "USDC.e" : "CRO";
        const toAsset = (decision === "BUY" || isLong) ? "CRO" : "USDC.e";
        const amountBaseUnits = String(Math.floor(actionMeta.qty * 1_000_000)); // 6 decimals for USDC.e
        
        try {
          const header = await createPaymentHeaderBase64({
            network: "cronos-testnet",
            assetContract: process.env.X402_ASSET_CONTRACT!,
            from: process.env.X402_FROM!,
            payTo: process.env.X402_PAY_TO!,
            amountBaseUnits,
          });
          
          const result = await executeSwap({
            network: "cronos-testnet",
            fromAsset,
            toAsset,
            amountInBaseUnits: amountBaseUnits,
            payTo: process.env.X402_PAY_TO!,
            assetContract: process.env.X402_ASSET_CONTRACT!,
            paymentHeaderBase64: header,
          });
          
          txHash = result.txHash;
        } catch (swapError: any) {
          console.error("Swap execution error:", swapError);
          throw new Error(`Swap failed: ${swapError?.message ?? String(swapError)}`);
        }
      }
    }

    await ExecutionModel.updateOne(
      { _id: exec._id },
      {
        $set: {
          status: "SUCCESS",
          decision,
          market,
          txHash,
          endTime: new Date(),
        },
      },
    );
  } catch (e: any) {
    await ExecutionModel.updateOne(
      { _id: exec._id },
      {
        $set: {
          status: "FAILURE",
          error: e?.message ?? String(e),
          endTime: new Date(),
        },
      },
    );
  }
}

async function schedulerTick() {
  const workflows = await WorkflowModel.find({}).lean();
  const now = Date.now();

  for (const wf of workflows) {
    const triggerNode = getTriggerNode(wf.nodes ?? []);
    if (!triggerNode) continue;

    // Timer trigger scheduling
    const timerSeconds = getTimerSeconds(triggerNode);
    if (timerSeconds) {
      const last = await ExecutionModel.findOne({ workflowId: wf._id })
        .sort({ startTime: -1 })
        .lean();

      const lastTime = last?.startTime ? new Date(last.startTime).getTime() : 0;
      if (now - lastTime >= timerSeconds * 1000) {
        await runWorkflowOnce(wf);
      }
      continue;
    }

    // Price trigger checking
    const priceTrigger = getPriceTrigger(triggerNode);
    if (priceTrigger) {
      // Check price every 30 seconds for price triggers
      const last = await ExecutionModel.findOne({ workflowId: wf._id })
        .sort({ startTime: -1 })
        .lean();

      const lastTime = last?.startTime ? new Date(last.startTime).getTime() : 0;
      if (now - lastTime >= 30_000) { // Check every 30 seconds
        try {
          const market = await fetchMarketSnapshot({ symbol: `${priceTrigger.asset}/USDC`, days: 30 });
          const currentPrice = market.spot;
          const lastPrice = last?.market?.spot;
          
          // Only trigger if price crossed threshold and we haven't executed recently
          if (lastPrice && 
              ((lastPrice < priceTrigger.price && currentPrice >= priceTrigger.price) ||
               (lastPrice > priceTrigger.price && currentPrice <= priceTrigger.price))) {
            await runWorkflowOnce(wf);
          } else if (!lastPrice && currentPrice >= priceTrigger.price) {
            // First check, trigger if already above threshold
            await runWorkflowOnce(wf);
          }
        } catch (e) {
          console.error(`Error checking price trigger for workflow ${wf._id}:`, e);
        }
      }
    }
  }
}

app.post("/signup", async (req, res) => {
  const { success, data } = SignupSchema.safeParse(req.body);
  if (!success) {
    res.status(403).json({
      message: "incorrect inputs",
    });
    return;
  }
  try {
    const user = await UserModel.create({
      username: data.username,
      password: data.password,
    });
    res.json({
      id: user._id,
    });
  } catch (e) {
    res.status(411).json({
      messsage: "username already exists",
    });
  }
});

app.post("/signin", async (req, res) => {
  const { success, data } = SigninSchema.safeParse(req.body);
  if (!success) {
    return;
  }
  try {
    const user = await UserModel.findOne({
      username: data.username,
      password: data.password,
    });

    if (user) {
      const token = jwt.sign(
        {
          id: user._id,
        },
        JWT_SECRET,
      );
      res.json({
        id: user._id,
        token,
      });
    } else {
      res.status(403).json({
        message: "user doesnt exist",
      });
    }
  } catch (e) {
    res.status(411).json({
      messsage: "username already exists",
    });
  }
});

app.post("/workflow", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const {success, data} = CreateWorkflowSchema.safeParse(req.body);
  if(!success){
    res.status(403).json({
    message: "Incorrect Inputs"
    })
    return
  }
  try{
    const Workflow = await WorkflowModel.create({
      UserID: userId,
      name: data?.name ?? "Untitled Workflow",
      strategy: data?.strategy ?? "normal",
      dipThresholdPct: data?.dipThresholdPct,
      volThresholdPct: data?.volThresholdPct,
      edges: data?.edges,
      nodes: data?.nodes,
      updatedAt: new Date(),
    })
    res.json({
       id: Workflow._id
    })
  } catch(e){
    res.status(411).json({
    message: "Incorrect Inputs"
    })
  }
});

app.put("/workflow/:id", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const {success, data} = CreateWorkflowSchema.safeParse(req.body);
  if(!success){
    res.status(403).json({ message: "Incorrect Inputs" });
    return;
  }
  try {
    const workflow = await WorkflowModel.findOne({ _id: req.params.id, UserID: userId });
    if (!workflow) {
      res.status(404).json({ message: "Workflow not found" });
      return;
    }
    await WorkflowModel.updateOne(
      { _id: req.params.id, UserID: userId },
      {
        $set: {
          name: data?.name ?? workflow.name,
          strategy: data?.strategy ?? workflow.strategy,
          dipThresholdPct: data?.dipThresholdPct ?? workflow.dipThresholdPct,
          volThresholdPct: data?.volThresholdPct ?? workflow.volThresholdPct,
          edges: data?.edges,
          nodes: data?.nodes,
          updatedAt: new Date(),
        },
      }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(411).json({ message: "Error updating workflow" });
  }
});

app.delete("/workflow/:id", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  try {
    const workflow = await WorkflowModel.findOne({ _id: req.params.id, UserID: userId });
    if (!workflow) {
      res.status(404).json({ message: "Workflow not found" });
      return;
    }
    await WorkflowModel.deleteOne({ _id: req.params.id, UserID: userId });
    await ExecutionModel.deleteMany({ workflowId: req.params.id });
    res.json({ ok: true });
  } catch (e) {
    res.status(411).json({ message: "Error deleting workflow" });
  }
});

app.get("/workflow/:id", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const workflow = await WorkflowModel.findOne({ _id: req.params.id, UserID: userId }).lean();
  if (!workflow) {
    res.status(404).json({ message: "Workflow not found" });
    return;
  }
  res.json({ workflow });
});

app.get("/workflow", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const workflows = await WorkflowModel.find({ UserID: userId }).sort({ _id: -1 }).lean();
  res.json({ workflows });
});

app.get("/workflow/:id/executions", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const workflow = await WorkflowModel.findOne({ _id: req.params.id, UserID: userId }).lean();
  if (!workflow) {
    res.status(404).json({ message: "workflow not found" });
    return;
  }
  const executions = await ExecutionModel.find({ workflowId: workflow._id })
    .sort({ startTime: -1 })
    .limit(100)
    .lean();
  res.json({ executions });
});

app.post("/workflow/:id/run", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const workflow = await WorkflowModel.findOne({ _id: req.params.id, UserID: userId }).lean();
  if (!workflow) {
    res.status(404).json({ message: "workflow not found" });
    return;
  }
  // Run immediately and return execution result
  await runWorkflowOnce(workflow);
  // Get the latest execution to return
  const latestExec = await ExecutionModel.findOne({ workflowId: workflow._id })
    .sort({ startTime: -1 })
    .lean();
  res.json({ ok: true, execution: latestExec });
});

app.get("/price/:asset", async (req, res) => {
  try {
    const asset = req.params.asset.toUpperCase();
    const symbol = `${asset}/USDC`;
    const market = await fetchMarketSnapshot({ symbol, days: 30 });
    res.json({ asset, price: market.spot, market });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Failed to fetch price" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// Simple in-process scheduler (dev). In prod, move to a dedicated worker.
setInterval(() => {
  schedulerTick().catch((e) => console.error("schedulerTick error", e));
}, 5_000);
