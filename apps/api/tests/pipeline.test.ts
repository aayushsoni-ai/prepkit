import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Server } from "http";
import { startFixtureServer, stopFixtureServer } from "../fixtures/serveFixtures.js";
import { validateKitInvariants } from "../src/domain/kit/invariants.js";
import { MockLlmClient } from "../src/llm/mock.js";
import { StageProgress } from "../src/pipeline/progress.js";
import { runPipeline } from "../src/pipeline/runPipeline.js";

describe("pipeline end-to-end execution", () => {
  let server: Server;
  let serverPort: number;

  beforeAll(async () => {
    server = await startFixtureServer(0);
    serverPort = (server.address() as { port: number }).port;
  });

  afterAll(async () => {
    await stopFixtureServer(server);
  });

  it("runs end-to-end and closes a planted gap on the second pass", async () => {
    const mock = new MockLlmClient();

    mock.enqueue({
      company_name: "Acme Inc",
      role_title: "Senior Distributed Engineer",
      role_level: "senior",
      requirements: [
        { text: "TypeScript and Node.js proficiency", evidence: "Must have 5+ years of experience in TypeScript and Node.js" },
        { text: "Distributed state machines", evidence: "Deep expertise in distributed state machines is required" },
        { text: "Rust knowledge", evidence: "Knowledge of Rust is a plus" }
      ]
    });

    mock.enqueue({ stages: ["Technical Screen", "System Design Round", "Take-Home Project"] });

    mock.enqueue({
      summary: "Acme creates modern developer infrastructure.",
      what_company_does: "Cloud execution runtimes.",
      culture: "Engineering excellence."
    });

    mock.enqueue((prompt) => {
      const isRepairPass = prompt.includes("Target Requirements");
      if (!isRepairPass) {
        return {
          questions: [
            { question: "Explain Node.js event loop phase execution.", guidance: "Evaluate microtask queue vs macrotask queue.", difficulty: 2, requirement_ids: [] }
          ]
        };
      }
      return {
        questions: [
          { question: "How do you achieve consensus across distributed state replicas?", guidance: "Evaluate Raft vs Paxos trade-offs.", difficulty: 3, requirement_ids: [] }
        ]
      };
    });

    mock.enqueue({
      questions: [
        { question: "How do you design a fault-tolerant distributed log?", guidance: "Detail partition tolerance.", difficulty: 3, requirement_ids: [] }
      ]
    });

    mock.enqueue({
      flashcards: [
        { front: "What is Raft log compaction?", back: "Snapshotting state to discard obsolete logs safely.", requirement_ids: [] }
      ]
    });

    const progressLogs: StageProgress[] = [];

    const result = await runPipeline(
      {
        jd: "We are seeking a Senior Distributed Engineer. Must have 5+ years of experience in TypeScript and Node.js. Deep expertise in distributed state machines is required. Knowledge of Rust is a plus.",
        company_url: `http://127.0.0.1:${serverPort}/sites/acme/index.html`,
        days: 5,
        userId: "test_user_42"
      },
      {
        llm: mock,
        allowPrivateHosts: true,
        onProgress: (p) => { progressLogs.push(p); }
      }
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.kit.company_name).toBe("Acme Inc");
    expect(result.kit.role_title).toBe("Senior Distributed Engineer");
    expect(result.kit.schedule.days.length).toBe(5);
    expect(result.kit.coverage.passes).toBeGreaterThanOrEqual(2);
    expect(result.kit.coverage.must_have_covered).toBe(result.kit.coverage.must_have_total);

    const invariants = validateKitInvariants(result.kit);
    expect(invariants.valid).toBe(true);
    expect(invariants.errors.length).toBe(0);

    const stageNames = progressLogs.map((p) => p.stage);
    expect(stageNames).toContain("validate_input");
    expect(stageNames).toContain("extract_requirements");
    expect(stageNames).toContain("crawl_company");
    expect(stageNames).toContain("assemble_kit");
  });

  it("returns typed error for invalid input", async () => {
    const mock = new MockLlmClient();
    const result = await runPipeline(
      { jd: "Too short", company_url: "not-a-valid-url", days: 100 },
      { llm: mock }
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("INVALID_INPUT");
  });
});
