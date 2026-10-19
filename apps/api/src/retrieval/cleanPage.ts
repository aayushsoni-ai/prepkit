import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export type PageClassification = "hiring" | "about" | "other";

export interface CleanedPage {
  url: string;
  title: string;
  content: string;
  classification: PageClassification;
}

export function classifyPage(url: string, title: string, text: string): PageClassification {
  const combined = `${url} ${title} ${text}`.toLowerCase();

  const hiringSignals = [
    "interview",
    "hiring process",
    "hiring stages",
    "stages",
    "careers",
    "career",
    "open roles",
    "take-home",
    "technical screen",
    "job openings",
    "jobs"
  ];

  for (const signal of hiringSignals) {
    if (combined.includes(signal)) {
      return "hiring";
    }
  }

  const aboutSignals = [
    "/about",
    "about us",
    "about ",
    "mission",
    "founded",
    "who we are",
    "leadership",
    "team",
    "company values"
  ];

  for (const signal of aboutSignals) {
    if (combined.includes(signal)) {
      return "about";
    }
  }

  return "other";
}

export function cleanPage(html: string, pageUrl: string, maxChars = 12000): CleanedPage {
  const dom = new JSDOM(html, { url: pageUrl });
  const doc = dom.window.document;

  const unwantedTags = ["script", "style", "nav", "footer", "form", "noscript", "svg"];
  for (const tag of unwantedTags) {
    const elements = doc.querySelectorAll(tag);
    elements.forEach((el) => el.remove());
  }

  const reader = new Readability(doc);
  const parsed = reader.parse();

  const title = (parsed?.title || doc.title || "").trim();
  let rawText = parsed?.textContent || doc.body?.textContent || "";
  rawText = rawText.replace(/\s+/g, " ").trim();

  if (rawText.length > maxChars) {
    rawText = rawText.slice(0, maxChars);
  }

  const classification = classifyPage(pageUrl, title, rawText);

  return {
    url: pageUrl,
    title,
    content: rawText,
    classification
  };
}
