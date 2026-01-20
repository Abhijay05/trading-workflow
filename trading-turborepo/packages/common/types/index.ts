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
  edges: z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
  }),
});
