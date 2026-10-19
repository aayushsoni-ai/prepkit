import * as cheerio from "cheerio";

export interface ExtractedLink {
  url: string;
  text: string;
  position: number;
}

export function extractLinks(html: string, baseUrl: string): ExtractedLink[] {
  const $ = cheerio.load(html);
  const links: ExtractedLink[] = [];
  const seen = new Set<string>();

  let index = 0;
  $("a").each((_, element) => {
    const rawHref = $(element).attr("href");
    if (!rawHref) return;

    const trimmedHref = rawHref.trim();
    if (trimmedHref.startsWith("#") || trimmedHref.startsWith("javascript:") || trimmedHref.startsWith("mailto:") || trimmedHref.startsWith("tel:")) {
      return;
    }

    let resolvedUrl: string;
    try {
      const parsed = new URL(trimmedHref, baseUrl);
      parsed.hash = "";
      resolvedUrl = parsed.toString();
    } catch {
      return;
    }

    if (seen.has(resolvedUrl)) return;
    seen.add(resolvedUrl);

    const anchorText = $(element).text().replace(/\s+/g, " ").trim();
    links.push({
      url: resolvedUrl,
      text: anchorText,
      position: index++
    });
  });

  return links;
}
