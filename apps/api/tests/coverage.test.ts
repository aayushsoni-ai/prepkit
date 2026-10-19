import { describe, expect, it } from "vitest";
import { checkCoverage } from "../src/domain/coverage/checkCoverage.js";
import { createFallbackQuestion, generateFallbackQuestions } from "../src/domain/coverage/fallbackQuestions.js";
import { Question, Requirement } from "../src/domain/kit/schema.js";

function createReq(id: string, priority: "must" | "nice"): Requirement {
  return {
    id,
    text: `Test skill ${id}`,
    evidence: `Evidence for ${id}`,
    priority,
    category: "technical"
  };
}

function createQuestion(id: string, reqIds: string[]): Question {
  return {
    id,
    category: "technical",
    question: `Question for ${id}`,
    guidance: `Guidance for ${id}`,
    difficulty: 2,
    requirement_ids: reqIds,
    origin: "generated",
    edited: false,
    pinned: false,
    updatedAt: new Date().toISOString()
  };
}

describe("coverage checking and gap repair", () => {
  it("detects covered and uncovered requirements", () => {
    const req1 = createReq("r1", "must");
    const req2 = createReq("r2", "must");
    const req3 = createReq("r3", "nice");
    const q1 = createQuestion("q1", ["r1"]);

    const report = checkCoverage([req1, req2, req3], [q1], 1);

    expect(report.coverage.must_have_total).toBe(2);
    expect(report.coverage.must_have_covered).toBe(1);
    expect(report.coverage.nice_to_have_total).toBe(1);
    expect(report.coverage.nice_to_have_covered).toBe(0);
    expect(report.uncoveredMustHaves.length).toBe(1);
    expect(report.uncoveredMustHaves[0].id).toBe("r2");
    expect(report.uncoveredNiceToHaves.length).toBe(1);
    expect(report.uncoveredNiceToHaves[0].id).toBe("r3");
    expect(report.coverage.passes).toBe(1);
  });

  it("simulates repair loop with fake model and fallback question", () => {
    const reqMust1 = createReq("req_must_1", "must");
    const reqMust2 = createReq("req_must_2", "must");
    const reqNice = createReq("req_nice", "nice");

    const reqs = [reqMust1, reqMust2, reqNice];
    let questions: Question[] = [createQuestion("q1", ["req_must_1"])];

    let pass = 1;
    let report = checkCoverage(reqs, questions, pass);

    while (report.uncoveredMustHaves.length > 0 && pass < 3) {
      pass++;
      report = checkCoverage(reqs, questions, pass);
    }

    if (report.uncoveredMustHaves.length > 0) {
      const fallbacks = generateFallbackQuestions(report.uncoveredMustHaves);
      questions = [...questions, ...fallbacks];
      report = checkCoverage(reqs, questions, pass);
    }

    expect(report.coverage.must_have_covered).toBe(report.coverage.must_have_total);
    expect(report.uncoveredMustHaves.length).toBe(0);
    expect(questions.some((q) => q.requirement_ids.includes("req_must_2"))).toBe(true);
  });

  it("creates deterministic fallback question with expected fields", () => {
    const req = createReq("r_must", "must");
    const fallback = createFallbackQuestion(req);

    expect(fallback.id).toMatch(/^q_/);
    expect(fallback.category).toBe(req.category);
    expect(fallback.requirement_ids).toEqual([req.id]);
    expect(fallback.difficulty).toBe(2);
    expect(fallback.origin).toBe("generated");
    expect(fallback.edited).toBe(false);
    expect(fallback.pinned).toBe(false);
  });
});
