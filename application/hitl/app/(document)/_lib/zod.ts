import { z } from "zod";

export function parseZodJSONString(arg: string, ctx: z.RefinementCtx) {
  try {
    return JSON.parse(arg);
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
}
