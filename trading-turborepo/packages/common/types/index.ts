import { z } from "zod";
export const SignupSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string(),
});
export const SigninSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string(),
});
