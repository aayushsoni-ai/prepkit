import { Brief } from "../../domain/kit/schema.js";
import { PipelineContext } from "../context.js";
import { briefOutputSchema, buildBriefPrompt } from "../prompts/brief.prompt.js";

export async function runBuildBriefStage(ctx: PipelineContext): Promise<Brief> {
  const pages = ctx.crawlResult?.pages ?? [];
  const companyName = ctx.validatedInput!.company_name;

  if (pages.length === 0) {
    const fallbackBrief: Brief = {
      summary: "No company information could be retrieved from the provided website.",
      what_company_does: "Information unavailable.",
      culture: "Culture information unavailable.",
      origin: "generated",
      edited: false,
      pinned: false,
      updatedAt: new Date().toISOString()
    };
    ctx.brief = fallbackBrief;
    ctx.checkpoint("build_brief", fallbackBrief);
    return fallbackBrief;
  }

  const sortedPages = [...pages].sort((a, b) => {
    if (a.classification === "about") return -1;
    if (b.classification === "about") return 1;
    return 0;
  });

  const combined = sortedPages
    .map((p) => `URL: ${p.url}\n${p.content}`)
    .join("\n\n")
    .slice(0, 8000);

  const { prompt, systemInstruction } = buildBriefPrompt(combined, companyName);
  const modelRes = await ctx.options.llm.generateJson(briefOutputSchema, prompt, {
    modelTier: "light",
    systemInstruction
  });

  const brief: Brief = {
    summary: modelRes.summary,
    what_company_does: modelRes.what_company_does,
    culture: modelRes.culture,
    origin: "generated",
    edited: false,
    pinned: false,
    updatedAt: new Date().toISOString()
  };

  ctx.brief = brief;
  ctx.checkpoint("build_brief", brief);
  return brief;
}
