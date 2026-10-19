import { searchBrave } from "./brave.js";
import { searchHackerNews } from "./hackerNews.js";
import type { DiscussionThread } from "./hackerNews.js";

export type { DiscussionThread };

export interface DiscussionSearchOptions {
  provider: "hackernews" | "brave";
  braveApiKey?: string;
  timeoutMs?: number;
}

export async function searchCompanyDiscussion(
  companyName: string,
  options: DiscussionSearchOptions
): Promise<DiscussionThread[]> {
  if (options.provider === "brave" && options.braveApiKey) {
    const results = await searchBrave(companyName, options.braveApiKey, options.timeoutMs);
    if (results.length > 0) return results;
  }

  return searchHackerNews(companyName, options.timeoutMs);
}
