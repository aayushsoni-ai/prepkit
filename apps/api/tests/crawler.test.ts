import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Server } from "http";
import { startFixtureServer, stopFixtureServer } from "../fixtures/serveFixtures.js";
import { crawlCompany } from "../src/retrieval/crawler.js";

describe("crawler against fixture sites", () => {
  let server: Server;
  let serverPort: number;

  beforeAll(async () => {
    server = await startFixtureServer(0);
    serverPort = (server.address() as { port: number }).port;
  });

  afterAll(async () => {
    await stopFixtureServer(server);
  });

  it("finds acme hiring page through unpredictable relative link path", async () => {
    const result = await crawlCompany(`http://127.0.0.1:${serverPort}/sites/acme/index.html`, {
      allowPrivate: true,
      maxPages: 6,
      delayMs: 10
    });

    expect(result.hiringPageFound).toBe(true);
    expect(result.aboutPageFound).toBe(true);
    expect(
      result.pages.some((p) => p.url.includes("our-interview-stages-unpredictable.html"))
    ).toBe(true);
  });

  it("reports harbor as having about page and no hiring page", async () => {
    const result = await crawlCompany(`http://127.0.0.1:${serverPort}/sites/harbor/index.html`, {
      allowPrivate: true,
      maxPages: 5,
      delayMs: 10
    });

    expect(result.aboutPageFound).toBe(true);
    expect(result.hiringPageFound).toBe(false);
  });

  it("crawls blank fixture without throwing", async () => {
    const result = await crawlCompany(`http://127.0.0.1:${serverPort}/sites/blank/index.html`, {
      allowPrivate: true,
      maxPages: 3,
      delayMs: 10
    });

    expect(result.hiringPageFound).toBe(false);
    expect(result.pages.length).toBeGreaterThan(0);
  });

  it("records skipped sources on failed fetches without throwing", async () => {
    const result = await crawlCompany(`http://127.0.0.1:${serverPort}/sites/nonexistent-path/index.html`, {
      allowPrivate: true,
      maxPages: 2,
      delayMs: 10
    });

    expect(result.skippedSources.length).toBeGreaterThan(0);
    expect(result.hiringPageFound).toBe(false);
  });
});
