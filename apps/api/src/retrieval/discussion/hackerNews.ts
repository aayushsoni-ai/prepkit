import { request } from "undici";

export interface DiscussionThread {
  url: string;
  title: string;
  snippet: string;
  date: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function searchHackerNews(
  companyName: string,
  timeoutMs = 6000
): Promise<DiscussionThread[]> {
  const query = `${companyName} interview hiring`;
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=8`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await request(url, { signal: controller.signal });
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return [];
    }

    const data = (await res.body.json()) as {
      hits?: Array<{
        objectID: string;
        title?: string;
        story_title?: string;
        comment_text?: string;
        story_text?: string;
        created_at: string;
      }>;
    };

    if (!data.hits) return [];

    const results: DiscussionThread[] = [];
    for (const hit of data.hits) {
      const text = hit.comment_text || hit.story_text || "";
      const title = hit.story_title || hit.title || `Hacker News discussion on ${companyName}`;
      results.push({
        url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        title,
        snippet: stripHtml(text).slice(0, 500),
        date: hit.created_at
      });
    }

    return results;
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
