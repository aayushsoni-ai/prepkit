import { Kit } from "../domain/kit/schema.js";
import { PipelineContext, PipelineInput, PipelineOptions } from "./context.js";
import { computeFingerprint } from "./fingerprint.js";
import { createProgressEvent, PipelineStageName } from "./progress.js";
import { runAssembleKitStage } from "./stages/assembleKit.js";
import { runBuildBriefStage } from "./stages/buildBrief.js";
import { runCrawlCompanyStage } from "./stages/crawlCompany.js";
import { runExtractRequirementsStage } from "./stages/extractRequirements.js";
import { runFindHiringProcessStage } from "./stages/findHiringProcess.js";
import { runGenerateFlashcardsStage } from "./stages/generateFlashcards.js";
import { runGenerateQuestionsStage } from "./stages/generateQuestions.js";
import { runSearchDiscussionStage } from "./stages/searchDiscussion.js";
import { runValidateInputStage } from "./stages/validateInput.js";

export type PipelineResult =
  | { success: true; kit: Kit; fingerprint: string }
  | { success: false; error: { code: string; message: string }; kit?: Kit };

function mapErrorCode(err: Error): string {
  const msg = err.message;
  if (msg.includes("INVALID_INPUT")) return "INVALID_INPUT";
  if (msg.includes("KIT_INVALID")) return "KIT_INVALID";
  if (msg.includes("Rate limit") || msg.includes("LLM") || msg.includes("Groq") || msg.includes("Gemini")) {
    return "LLM_UNAVAILABLE";
  }
  return "PIPELINE_ERROR";
}

async function notify(ctx: PipelineContext, stage: PipelineStageName, status: "running" | "done" | "skipped" | "failed", msg?: string, output?: unknown): Promise<void> {
  if (ctx.options.onProgress) {
    const event = createProgressEvent(stage, status, msg, output);
    await ctx.options.onProgress(event);
  }
}

export async function runPipeline(input: PipelineInput, options: PipelineOptions): Promise<PipelineResult> {
  const ctx = new PipelineContext(input, options);

  try {
    await notify(ctx, "validate_input", "running");
    await runValidateInputStage(ctx);
    await notify(ctx, "validate_input", "done");

    await notify(ctx, "extract_requirements", "running");
    await runExtractRequirementsStage(ctx);
    await notify(ctx, "extract_requirements", "done");

    await notify(ctx, "crawl_company", "running");
    await runCrawlCompanyStage(ctx);
    await notify(ctx, "crawl_company", "done");

    await notify(ctx, "find_hiring_process", "running");
    await runFindHiringProcessStage(ctx);
    await notify(ctx, "find_hiring_process", "done");

    await notify(ctx, "search_discussion", "running");
    await runSearchDiscussionStage(ctx);
    await notify(ctx, "search_discussion", "done");

    await notify(ctx, "build_brief", "running");
    await runBuildBriefStage(ctx);
    await notify(ctx, "build_brief", "done");

    await notify(ctx, "generate_questions", "running");
    await runGenerateQuestionsStage(ctx);
    await notify(ctx, "generate_questions", "done");

    await notify(ctx, "generate_flashcards", "running");
    await runGenerateFlashcardsStage(ctx);
    await notify(ctx, "generate_flashcards", "done");

    await notify(ctx, "assemble_kit", "running");
    const kit = await runAssembleKitStage(ctx);
    await notify(ctx, "assemble_kit", "done");

    const fingerprint = computeFingerprint(
      ctx.validatedInput!.userId,
      ctx.validatedInput!.jd,
      ctx.validatedInput!.company_url
    );

    return {
      success: true,
      kit,
      fingerprint
    };
  } catch (err) {
    const error = err as Error;
    const code = mapErrorCode(error);
    return {
      success: false,
      error: { code, message: error.message }
    };
  }
}
