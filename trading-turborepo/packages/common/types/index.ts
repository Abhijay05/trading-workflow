import { z } from "zod";
export const SignupSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string(),
});
export const SigninSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string(),
});
export const CreateWorkflowSchema = z.object({
  name: z.string().optional(),
  strategy: z.enum(["smart", "normal"]).optional().default("normal"),
  dipThresholdPct: z.number().optional(),
  volThresholdPct: z.number().optional(),
  nodes: z.array(
    z.object({
      type: z.string(),
      id: z.string(),
      data: z.object({
        kind: z.enum(["action", "trigger"]),
        metadata: z.any(),
        label: z.string(),
      }),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
    }),
  ),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
  })),
});
