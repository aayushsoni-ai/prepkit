import { PipelineContext } from "../context.js";
import { buildHiringProcessPrompt, hiringProcessOutputSchema } from "../prompts/hiringProcess.prompt.js";

export async function runFindHiringProcessStage(ctx: PipelineContext): Promise<string[]> {
  const pages = ctx.crawlResult?.pages ?? [];
  const hiringPages = pages.filter((p) => p.classification === "hiring");

  if (hiringPages.length === 0) {
    ctx.hiringStages = [];
    ctx.checkpoint("find_hiring_process", []);
    return [];
  }

  const combinedContent = hiringPages
    .map((p) => `URL: ${p.url}\n${p.content}`)
    .join("\n\n")
    .slice(0, 6000);

  const { prompt, systemInstruction } = buildHiringProcessPrompt(combinedContent);
  const result = await ctx.options.llm.generateJson(hiringProcessOutputSchema, prompt, {
    modelTier: "light",
    systemInstruction
  });

  ctx.hiringStages = result.stages;
  ctx.checkpoint("find_hiring_process", result.stages);
  return result.stages;
}
