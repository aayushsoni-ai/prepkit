import { DiscussionThread, searchCompanyDiscussion } from "../../retrieval/discussion/index.js";
import { PipelineContext } from "../context.js";

export async function runSearchDiscussionStage(ctx: PipelineContext): Promise<DiscussionThread[]> {
  if (ctx.isBudgetExceeded()) {
    ctx.discussions = [];
    ctx.checkpoint("search_discussion", { skipped: true, reason: "budget_exceeded" });
    return [];
  }

  const name = ctx.validatedInput!.company_name || new URL(ctx.validatedInput!.company_url).hostname;
  const provider = ctx.options.searchProvider ?? "hackernews";

  const results = await searchCompanyDiscussion(name, {
    provider,
    braveApiKey: ctx.options.braveApiKey,
    timeoutMs: 4000
  });

  ctx.discussions = results;
  ctx.checkpoint("search_discussion", { count: results.length });
  return results;
}
