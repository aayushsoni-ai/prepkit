import { request } from "undici";
import { DiscussionThread } from "./hackerNews.js";

export async function searchBrave(
  companyName: string,
  apiKey: string,
  timeoutMs = 6000
): Promise<DiscussionThread[]> {
  if (!apiKey || apiKey.trim().length === 0) {
    return [];
  }

  const query = `${companyName} interview hiring process`;
  const endpoint = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await request(endpoint, {
      headers: {
        "X-Subscription-Token": apiKey,
        Accept: "application/json"
      },
      signal: controller.signal
    });

    if (res.statusCode < 200 || res.statusCode >= 300) {
      return [];
    }

    const data = (await res.body.json()) as {
      web?: {
        results?: Array<{
          url: string;
          title: string;
          description: string;
          page_age?: string;
        }>;
      };
    };

    const results: DiscussionThread[] = [];
    for (const item of data.web?.results || []) {
      results.push({
        url: item.url,
        title: item.title,
        snippet: item.description || "",
        date: item.page_age || new Date().toISOString()
      });
    }

    return results;
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
