import { z } from "zod";
import { createKitId } from "../../domain/kit/ids.js";
import { PipelineContext, ValidatedInput } from "../context.js";

const inputValidator = z.object({
  id: z.string().default(() => createKitId()),
  jd: z.string().min(10, "Job description too short"),
  company_url: z.string().url("Invalid company URL"),
  days: z.number().int().min(1).max(60),
  company_name: z.string().default(""),
  role_title: z.string().default(""),
  userId: z.string().default("anonymous")
});

export async function runValidateInputStage(ctx: PipelineContext): Promise<ValidatedInput> {
  const result = inputValidator.safeParse({
    id: ctx.input.id,
    jd: ctx.input.jd,
    company_url: ctx.input.company_url,
    days: ctx.input.days,
    company_name: ctx.input.company_name,
    role_title: ctx.input.role_title,
    userId: ctx.input.userId
  });

  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join(", ");
    throw new Error(`INVALID_INPUT: ${msg}`);
  }

  ctx.validatedInput = result.data;
  ctx.checkpoint("validate_input", result.data);
  return result.data;
}
