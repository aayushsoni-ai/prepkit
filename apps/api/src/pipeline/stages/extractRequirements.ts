import { createRequirementId } from "../../domain/kit/ids.js";
import { Requirement } from "../../domain/kit/schema.js";
import { groundRequirements } from "../../domain/requirements/groundRequirements.js";
import { PipelineContext } from "../context.js";
import { buildRequirementsPrompt, rawRequirementsOutputSchema } from "../prompts/requirements.prompt.js";

export async function runExtractRequirementsStage(ctx: PipelineContext): Promise<Requirement[]> {
  const jd = ctx.validatedInput!.jd;
  const { prompt, systemInstruction } = buildRequirementsPrompt(jd);

  const rawExtracted = await ctx.options.llm.generateJson(rawRequirementsOutputSchema, prompt, {
    modelTier: "heavy",
    systemInstruction
  });

  if (!ctx.validatedInput!.company_name && rawExtracted.company_name) {
    ctx.validatedInput!.company_name = rawExtracted.company_name;
  }
  if (!ctx.validatedInput!.role_title && rawExtracted.role_title) {
    ctx.validatedInput!.role_title = rawExtracted.role_title;
  }

  const candidateList = rawExtracted.requirements.map((req) => ({
    id: createRequirementId(),
    text: req.text,
    evidence: req.evidence
  }));

  const grounded = groundRequirements(candidateList, jd, ctx.hiringStages);

  if (grounded.length < 3) {
    if (!ctx.warnings.includes("thin_job_description")) {
      ctx.warnings.push("thin_job_description");
    }
  }

  ctx.groundedRequirements = grounded;
  ctx.checkpoint("extract_requirements", grounded);
  return grounded;
}
