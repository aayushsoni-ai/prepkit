import { CleanedPage, cleanPage } from "./cleanPage.js";
import { extractLinks } from "./extractLinks.js";
import { rankLinks } from "./rankLinks.js";
import { isAllowedByRobots, parseRobotsTxt, RobotsRules } from "./robots.js";
import { safeFetch } from "./safeFetch.js";
import { parseSitemapXml } from "./sitemap.js";

export interface CrawlOptions {
  maxPages?: number;
  delayMs?: number;
  allowPrivate?: boolean;
  timeoutMs?: number;
}

export interface CrawlResult {
  pages: CleanedPage[];
  skippedSources: Array<{ url: string; reason: string }>;
  hiringPageFound: boolean;
  aboutPageFound: boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, allowPrivate: boolean, timeoutMs: number, maxRetries = 2): Promise<string> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await safeFetch(url, { allowPrivate, timeoutMs });
      if (res.status >= 400) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.text;
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxRetries) {
        await sleep(100 * (attempt + 1) + Math.random() * 50);
      }
    }
  }
  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

export async function crawlCompany(rawBaseUrl: string, options: CrawlOptions = {}): Promise<CrawlResult> {
  const maxPages = options.maxPages ?? 6;
  const baseDelay = options.delayMs ?? 100;
  const allowPrivate = options.allowPrivate ?? false;
  const timeoutMs = options.timeoutMs ?? 6000;

  const skippedSources: Array<{ url: string; reason: string }> = [];
  const visitedUrls = new Set<string>();
  const cleanedPages: CleanedPage[] = [];

  let origin: string;
  try {
    const parsed = new URL(rawBaseUrl);
    origin = parsed.origin;
  } catch {
    return {
      pages: [],
      skippedSources: [{ url: rawBaseUrl, reason: "invalid_url" }],
      hiringPageFound: false,
      aboutPageFound: false
    };
  }

  let robots: RobotsRules = { disallowedPaths: [], crawlDelayMs: 0 };
  try {
    const robotsText = await fetchWithRetry(`${origin}/robots.txt`, allowPrivate, timeoutMs, 1);
    robots = parseRobotsTxt(robotsText);
  } catch {
  }

  let sitemapCandidates: string[] = [];
  try {
    const sitemapText = await fetchWithRetry(`${origin}/sitemap.xml`, allowPrivate, timeoutMs, 1);
    sitemapCandidates = parseSitemapXml(sitemapText);
  } catch {
  }

  const urlQueue: string[] = [rawBaseUrl];
  for (const sUrl of sitemapCandidates) {
    if (!urlQueue.includes(sUrl)) {
      urlQueue.push(sUrl);
    }
  }

  while (urlQueue.length > 0 && cleanedPages.length < maxPages) {
    const currentUrl = urlQueue.shift()!;
    if (visitedUrls.has(currentUrl)) continue;
    visitedUrls.add(currentUrl);

    try {
      const parsed = new URL(currentUrl);
      if (!isAllowedByRobots(parsed.pathname, robots)) {
        skippedSources.push({ url: currentUrl, reason: "blocked_by_robots" });
        continue;
      }
    } catch {
      continue;
    }

    const waitTime = Math.max(baseDelay, robots.crawlDelayMs);
    if (cleanedPages.length > 0 && waitTime > 0) {
      await sleep(waitTime);
    }

    let html: string;
    try {
      html = await fetchWithRetry(currentUrl, allowPrivate, timeoutMs);
    } catch (err) {
      skippedSources.push({ url: currentUrl, reason: (err as Error).message });
      continue;
    }

    const cleaned = cleanPage(html, currentUrl);
    cleanedPages.push(cleaned);

    const extracted = extractLinks(html, currentUrl);
    const ranked = rankLinks(extracted, origin);

    for (const link of ranked) {
      if (!visitedUrls.has(link.url) && !urlQueue.includes(link.url)) {
        urlQueue.push(link.url);
      }
    }
  }

  const hiringFound = cleanedPages.some((p) => p.classification === "hiring");
  const aboutFound = cleanedPages.some((p) => p.classification === "about");

  return {
    pages: cleanedPages,
    skippedSources,
    hiringPageFound: hiringFound,
    aboutPageFound: aboutFound
  };
}
