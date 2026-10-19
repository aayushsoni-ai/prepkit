import { describe, expect, it } from "vitest";
import { Question, Requirement } from "../src/domain/kit/schema.js";
import { allocateSchedule } from "../src/domain/schedule/allocateSchedule.js";

function createMockReq(id: string, priority: "must" | "nice"): Requirement {
  return {
    id,
    text: `Requirement ${id}`,
    evidence: `Evidence for ${id}`,
    priority,
    category: "technical"
  };
}

function createMockQuestion(id: string, difficulty: 1 | 2 | 3, reqIds: string[]): Question {
  return {
    id,
    category: "technical",
    question: `Question ${id}`,
    guidance: `Guidance for ${id}`,
    difficulty,
    requirement_ids: reqIds,
    origin: "generated",
    edited: false,
    pinned: false,
    updatedAt: new Date().toISOString()
  };
}

describe("allocateSchedule", () => {
  it("handles zero questions across any day count", () => {
    const res1 = allocateSchedule([], [], 1);
    expect(res1.days.length).toBe(1);
    expect(res1.days[0].minutes).toBe(0);
    expect(res1.days[0].question_ids).toEqual([]);
    expect(res1.days[0].focus).toBe("Nothing to schedule");

    const res60 = allocateSchedule([], [], 60);
    expect(res60.days.length).toBe(60);
    expect(res60.days[59].minutes).toBe(0);
    expect(res60.days[0].focus).toBe("Nothing to schedule");
  });

  it("handles 1-day schedule with questions", () => {
    const reqs = [createMockReq("r1", "must")];
    const qs = [
      createMockQuestion("q1", 3, ["r1"]),
      createMockQuestion("q2", 2, ["r1"])
    ];
    const res = allocateSchedule(qs, reqs, 1);
    expect(res.days.length).toBe(1);
    expect(res.days[0].phase).toBe("learn");
    expect(res.days[0].question_ids).toContain("q1");
    expect(res.days[0].question_ids).toContain("q2");
    expect(res.days[0].minutes % 5).toBe(0);
    expect(Number.isInteger(res.days[0].minutes)).toBe(true);
  });

  it("handles 60-day schedule", () => {
    const reqs = [createMockReq("r1", "must"), createMockReq("r2", "nice")];
    const qs = Array.from({ length: 20 }, (_, i) =>
      createMockQuestion(`q_${i}`, ((i % 3) + 1) as 1 | 2 | 3, [i % 2 === 0 ? "r1" : "r2"])
    );
    const res = allocateSchedule(qs, reqs, 60);
    expect(res.days.length).toBe(60);
    for (let i = 0; i < 60; i++) {
      expect(res.days[i].day).toBe(i + 1);
      expect(Number.isInteger(res.days[i].minutes)).toBe(true);
      expect(res.days[i].minutes % 5).toBe(0);
    }
  });

  it("handles fewer questions than days", () => {
    const reqs = [createMockReq("r1", "must")];
    const qs = [
      createMockQuestion("q1", 3, ["r1"]),
      createMockQuestion("q2", 1, ["r1"])
    ];
    const res = allocateSchedule(qs, reqs, 5);
    expect(res.days.length).toBe(5);
    const learnDays = res.days.filter((d) => d.phase === "learn");
    const reviewDays = res.days.filter((d) => d.phase === "review");
    expect(learnDays.length).toBe(2);
    expect(reviewDays.length).toBe(3);
  });

  it("places every question exactly once in learn days", () => {
    const reqs = [createMockReq("r1", "must"), createMockReq("r2", "must")];
    const qs = Array.from({ length: 8 }, (_, i) =>
      createMockQuestion(`q_${i}`, 2, ["r1"])
    );
    const res = allocateSchedule(qs, reqs, 4);
    expect(res.days.length).toBe(4);

    const learnDays = res.days.filter((d) => d.phase === "learn");
    const placedInLearn: string[] = [];
    for (const d of learnDays) {
      placedInLearn.push(...d.question_ids);
    }
    expect(placedInLearn.length).toBe(qs.length);
    expect(new Set(placedInLearn).size).toBe(qs.length);
  });

  it("places higher priority and harder questions on earlier days", () => {
    const reqMust = createMockReq("must_1", "must");
    const reqNice = createMockReq("nice_1", "nice");
    const qHardMust = createMockQuestion("q_hard_must", 3, ["must_1"]);
    const qEasyNice = createMockQuestion("q_easy_nice", 1, ["nice_1"]);

    const res = allocateSchedule([qEasyNice, qHardMust], [reqMust, reqNice], 2);
    expect(res.days[0].question_ids).toContain("q_hard_must");
    expect(res.days[1].question_ids).toContain("q_easy_nice");
  });

  it("passes property style tests over random inputs", () => {
    for (let testRun = 0; testRun < 20; testRun++) {
      const qCount = Math.floor(Math.random() * 25);
      const days = Math.floor(Math.random() * 59) + 1;
      const reqCount = Math.floor(Math.random() * 10) + 1;

      const reqs = Array.from({ length: reqCount }, (_, i) =>
        createMockReq(`r_${i}`, i % 2 === 0 ? "must" : "nice")
      );
      const qs = Array.from({ length: qCount }, (_, i) =>
        createMockQuestion(`q_${i}`, ((i % 3) + 1) as 1 | 2 | 3, [`r_${i % reqCount}`])
      );

      const res = allocateSchedule(qs, reqs, days);
      expect(res.days.length).toBe(days);
      for (let i = 0; i < days; i++) {
        expect(res.days[i].day).toBe(i + 1);
        expect(Number.isInteger(res.days[i].minutes)).toBe(true);
        expect(res.days[i].minutes % 5).toBe(0);
      }
    }
  });
});
