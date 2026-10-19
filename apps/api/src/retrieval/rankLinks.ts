import { ExtractedLink } from "./extractLinks.js";

const HIRING_KEYWORDS = [
  "career",
  "careers",
  "job",
  "jobs",
  "hiring",
  "interview",
  "process",
  "stages",
  "opening",
  "openings",
  "work-with-us"
];

const COMPANY_KEYWORDS = [
  "handbook",
  "values",
  "culture",
  "team",
  "about",
  "engineering",
  "people",
  "story",
  "mission"
];

const PENALTY_KEYWORDS = [
  "login",
  "signin",
  "signup",
  "register",
  "auth",
  "privacy",
  "terms",
  "legal",
  "cookie",
  "pricing",
  "billing",
  "cart",
  "checkout",
  "download",
  ".pdf",
  ".png",
  ".jpg",
  ".zip"
];

function isAllowedOrigin(linkUrl: string, baseOrigin: string): boolean {
  try {
    const linkParsed = new URL(linkUrl);
    const baseParsed = new URL(baseOrigin);
    if (linkParsed.origin === baseParsed.origin) return true;
    if (linkParsed.hostname.endsWith(`.${baseParsed.hostname}`)) {
      const sub = linkParsed.hostname.replace(`.${baseParsed.hostname}`, "");
      return ["careers", "jobs", "handbook", "about"].includes(sub);
    }
    return false;
  } catch {
    return false;
  }
}

export function scoreLink(link: ExtractedLink): number {
  const textLower = link.text.toLowerCase();
  const urlLower = link.url.toLowerCase();
  const combined = `${textLower} ${urlLower}`;

  for (const penalty of PENALTY_KEYWORDS) {
    if (combined.includes(penalty)) {
      return -50;
    }
  }

  let score = 0;

  for (const kw of HIRING_KEYWORDS) {
    if (textLower.includes(kw)) score += 25;
    else if (urlLower.includes(kw)) score += 15;
  }

  for (const kw of COMPANY_KEYWORDS) {
    if (textLower.includes(kw)) score += 10;
    else if (urlLower.includes(kw)) score += 8;
  }

  score += Math.max(0, 5 - Math.floor(link.position / 4));
  return score;
}

export function rankLinks(links: ExtractedLink[], baseOrigin: string): ExtractedLink[] {
  return links
    .filter((link) => isAllowedOrigin(link.url, baseOrigin))
    .map((link) => ({ link, score: scoreLink(link) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ link }) => link);
}
