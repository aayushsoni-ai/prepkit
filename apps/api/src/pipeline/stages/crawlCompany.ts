import { crawlCompany, CrawlResult } from "../../retrieval/crawler.js";
import { PipelineContext } from "../context.js";

export async function runCrawlCompanyStage(ctx: PipelineContext): Promise<CrawlResult> {
  const url = ctx.validatedInput!.company_url;
  const allowPrivate = ctx.options.allowPrivateHosts ?? false;

  const result = await crawlCompany(url, {
    allowPrivate,
    maxPages: 6,
    delayMs: 50,
    timeoutMs: 6000
  });

  if (result.pages.length === 0) {
    if (!ctx.warnings.includes("no_company_information")) {
      ctx.warnings.push("no_company_information");
    }
  }

  ctx.crawlResult = result;
  ctx.checkpoint("crawl_company", {
    pageCount: result.pages.length,
    hiringFound: result.hiringPageFound,
    aboutFound: result.aboutPageFound,
    skipped: result.skippedSources.length
  });

  return result;
}
