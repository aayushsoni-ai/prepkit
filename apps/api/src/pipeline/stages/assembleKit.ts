import { checkCoverage } from "../../domain/coverage/checkCoverage.js";
import { assertKitInvariants } from "../../domain/kit/invariants.js";
import { Kit, kitSchema } from "../../domain/kit/schema.js";
import { allocateSchedule } from "../../domain/schedule/allocateSchedule.js";
import { PipelineContext } from "../context.js";

export async function runAssembleKitStage(ctx: PipelineContext): Promise<Kit> {
  const schedule = allocateSchedule(
    ctx.questions,
    ctx.groundedRequirements,
    ctx.validatedInput!.days
  );

  const coverage = ctx.coverage ?? checkCoverage(
    ctx.groundedRequirements,
    ctx.questions,
    1
  ).coverage;

  const brief = ctx.brief ?? {
    summary: "Brief unavailable.",
    what_company_does: "Unavailable.",
    culture: "Unavailable.",
    origin: "generated",
    edited: false,
    pinned: false,
    updatedAt: new Date().toISOString()
  };

  const candidateKit: Kit = {
    id: ctx.validatedInput!.id,
    company_name: ctx.validatedInput!.company_name || "Company",
    role_title: ctx.validatedInput!.role_title || "Software Engineer",
    company_url: ctx.validatedInput!.company_url,
    days_available: ctx.validatedInput!.days,
    brief,
    role: {
      title: ctx.validatedInput!.role_title || "Software Engineer",
      level: "mid",
      requirements: ctx.groundedRequirements
    },
    questions: ctx.questions,
    flashcards: ctx.flashcards,
    schedule,
    coverage,
    research: {
      hiring_page_found: ctx.crawlResult?.hiringPageFound ?? false,
      discussion_found: ctx.discussions.length > 0,
      hiring_stages: ctx.hiringStages,
      skipped_sources: ctx.crawlResult?.skippedSources ?? []
    },
    warnings: [...ctx.warnings],
    version: 1
  };

  const parsed = kitSchema.safeParse(candidateKit);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((i) => i.message).join(", ");
    throw new Error(`KIT_INVALID: ${errorDetails}`);
  }

  assertKitInvariants(parsed.data);

  ctx.checkpoint("assemble_kit", { kitId: parsed.data.id });
  return parsed.data;
}
