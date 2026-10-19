import { describe, expect, it } from "vitest";
import { rankLinks, scoreLink } from "../src/retrieval/rankLinks.js";

describe("rankLinks scoring", () => {
  it("scores career and interview links higher than general links", () => {
    const hiringLink = {
      url: "https://example.com/careers/interview-process",
      text: "Interview Process & Hiring",
      position: 1
    };
    const aboutLink = {
      url: "https://example.com/about",
      text: "About Us",
      position: 2
    };

    expect(scoreLink(hiringLink)).toBeGreaterThan(scoreLink(aboutLink));
  });

  it("penalizes login, legal, and download links", () => {
    const loginLink = {
      url: "https://example.com/login",
      text: "Sign In",
      position: 0
    };
    const pdfLink = {
      url: "https://example.com/report.pdf",
      text: "Download Report",
      position: 1
    };

    expect(scoreLink(loginLink)).toBeLessThan(0);
    expect(scoreLink(pdfLink)).toBeLessThan(0);
  });

  it("excludes links from unapproved foreign origins", () => {
    const links = [
      { url: "https://example.com/careers", text: "Careers", position: 0 },
      { url: "https://phishing.com/careers", text: "Careers", position: 1 }
    ];

    const ranked = rankLinks(links, "https://example.com");
    expect(ranked.length).toBe(1);
    expect(ranked[0].url).toBe("https://example.com/careers");
  });
});
