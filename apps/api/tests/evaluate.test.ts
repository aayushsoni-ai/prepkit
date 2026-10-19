import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFile, rm, writeFile } from "fs/promises";
import { Server } from "http";
import { join } from "path";
import { startFixtureServer, stopFixtureServer } from "../fixtures/serveFixtures.js";
import { serializeKit } from "../src/domain/kit/serialize.js";
import { MockLlmClient } from "../src/llm/mock.js";
import { runPipeline } from "../src/pipeline/runPipeline.js";
import { BatchReportWriter } from "../src/cli/report.js";

describe("batch evaluate runner", () => {
  let server: Server;
  let serverPort: number;
  const testOutFile = join(process.cwd(), "scratch-test-kits.json");

  beforeAll(async () => {
    server = await startFixtureServer(0);
    serverPort = (server.address() as { port: number }).port;
  });

  afterAll(async () => {
    await stopFixtureServer(server);
    try {
      await rm(testOutFile);
    } catch {}
  });

  it("processes cases with batch reporting and continues after a failed case", async () => {
    const mock = new MockLlmClient();

    mock.enqueue({
      company_name: "Acme Inc",
      role_title: "Backend Engineer",
      role_level: "mid",
      requirements: [{ text: "TypeScript", evidence: "Must have TypeScript" }]
    });
    mock.enqueue({ stages: [] });
    mock.enqueue({ summary: "Summary", what_company_does: "Tools", culture: "Culture" });
    mock.enqueue({
      questions: [{ question: "Explain types", guidance: "Guidance", difficulty: 1, requirement_ids: [] }]
    });
    mock.enqueue({ flashcards: [{ front: "Front", back: "Back", requirement_ids: [] }] });

    mock.enqueue({
      company_name: "Harbor",
      role_title: "Logistics Engineer",
      role_level: "mid",
      requirements: [{ text: "SQL", evidence: "Must have SQL" }]
    });
    mock.enqueue({ stages: [] });
    mock.enqueue({ summary: "Summary", what_company_does: "Logistics", culture: "Culture" });
    mock.enqueue({
      questions: [{ question: "Explain indexes", guidance: "Guidance", difficulty: 2, requirement_ids: [] }]
    });
    mock.enqueue({ flashcards: [{ front: "Index front", back: "Index back", requirement_ids: [] }] });

    const cases = [
      {
        id: "case-success-1",
        company_url: `http://127.0.0.1:${serverPort}/sites/acme/index.html`,
        days: 3,
        jd: "Backend Engineer needed. Must have TypeScript."
      },
      {
        id: "case-failure-invalid",
        company_url: "invalid-url",
        days: 100,
        jd: "Too short"
      },
      {
        id: "case-success-2",
        company_url: `http://127.0.0.1:${serverPort}/sites/harbor/index.html`,
        days: 2,
        jd: "Logistics Engineer needed. Must have SQL."
      }
    ];

    const writer = new BatchReportWriter(testOutFile);

    for (const item of cases) {
      const res = await runPipeline(
        { id: item.id, jd: item.jd, company_url: item.company_url, days: item.days },
        { llm: mock, allowPrivateHosts: true }
      );

      if (res.success) {
        await writer.recordResult({
          id: item.id,
          status: "ok",
          kit: serializeKit(res.kit),
          error: null
        });
      } else {
        await writer.recordResult({
          id: item.id,
          status: "failed",
          kit: null,
          error: res.error
        });
      }
    }

    const writtenJson = JSON.parse(await readFile(testOutFile, "utf-8"));

    expect(String(writtenJson.version)).toBe("1.0");
    expect(writtenJson.kits.length).toBe(3);

    expect(writtenJson.kits[0].id).toBe("case-success-1");
    expect(writtenJson.kits[0].status).toBe("ok");
    expect(writtenJson.kits[0].kit).toBeDefined();

    expect(writtenJson.kits[1].id).toBe("case-failure-invalid");
    expect(writtenJson.kits[1].status).toBe("failed");
    expect(writtenJson.kits[1].error.code).toBe("INVALID_INPUT");

    expect(writtenJson.kits[2].id).toBe("case-success-2");
    expect(writtenJson.kits[2].status).toBe("ok");
  });
});
