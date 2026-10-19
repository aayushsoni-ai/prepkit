import { describe, expect, it } from "vitest";
import { buildPracticeQueue, CardPracticeRecord } from "../src/domain/practice/buildQueue.js";
import { calculateRequirementMastery } from "../src/domain/practice/mastery.js";
import { Flashcard, Requirement } from "../src/domain/kit/schema.js";

function createFlashcard(id: string, reqId: string): Flashcard {
  return {
    id,
    front: `Front ${id}`,
    back: `Back ${id}`,
    requirement_ids: [reqId],
    origin: "generated",
    edited: false,
    pinned: false,
    updatedAt: new Date().toISOString()
  };
}

describe("practice queue and mastery", () => {
  const reqMust: Requirement = {
    id: "req_must",
    text: "Distributed systems",
    evidence: "Required",
    priority: "must",
    category: "system-design"
  };

  const reqNice: Requirement = {
    id: "req_nice",
    text: "Rust",
    evidence: "A plus",
    priority: "nice",
    category: "technical"
  };

  it("prioritizes unseen cards (confidence 0) before seen cards", () => {
    const card1 = createFlashcard("c1", reqMust.id);
    const card2 = createFlashcard("c2", reqNice.id);

    const history = new Map<string, CardPracticeRecord>([
      [
        "c2",
        {
          card_id: "c2",
          last_confidence: 4,
          last_practiced_at: new Date().toISOString(),
          practice_count: 1
        }
      ]
    ]);

    const queue = buildPracticeQueue([card2, card1], history, [reqMust, reqNice]);
    expect(queue[0].id).toBe("c1");
    expect(queue[1].id).toBe("c2");
  });

  it("prioritizes lower confidence over higher confidence", () => {
    const cardLow = createFlashcard("c_low", reqMust.id);
    const cardHigh = createFlashcard("c_high", reqNice.id);

    const history = new Map<string, CardPracticeRecord>([
      [
        "c_low",
        {
          card_id: "c_low",
          last_confidence: 1,
          last_practiced_at: "2026-10-18T10:00:00.000Z",
          practice_count: 2
        }
      ],
      [
        "c_high",
        {
          card_id: "c_high",
          last_confidence: 5,
          last_practiced_at: "2026-10-17T10:00:00.000Z",
          practice_count: 3
        }
      ]
    ]);

    const queue = buildPracticeQueue([cardHigh, cardLow], history, [reqMust, reqNice]);
    expect(queue[0].id).toBe("c_low");
  });

  it("breaks ties with longest time since last practice and must-have priority", () => {
    const cardOld = createFlashcard("c_old", reqMust.id);
    const cardRecent = createFlashcard("c_recent", reqMust.id);

    const history = new Map<string, CardPracticeRecord>([
      [
        "c_old",
        {
          card_id: "c_old",
          last_confidence: 2,
          last_practiced_at: "2026-10-01T10:00:00.000Z",
          practice_count: 1
        }
      ],
      [
        "c_recent",
        {
          card_id: "c_recent",
          last_confidence: 2,
          last_practiced_at: "2026-10-19T10:00:00.000Z",
          practice_count: 1
        }
      ]
    ]);

    const queue = buildPracticeQueue([cardRecent, cardOld], history, [reqMust]);
    expect(queue[0].id).toBe("c_old");
  });

  it("filters queue by requirement ids for weak spots drill", () => {
    const card1 = createFlashcard("c1", reqMust.id);
    const card2 = createFlashcard("c2", reqNice.id);

    const history = new Map<string, CardPracticeRecord>();
    const queue = buildPracticeQueue([card1, card2], history, [reqMust, reqNice], 10, [reqMust.id]);

    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe("c1");
  });

  it("calculates requirement mastery and lists weakest requirements", () => {
    const card1 = createFlashcard("c1", reqMust.id);
    const card2 = createFlashcard("c2", reqNice.id);

    const history = new Map<string, CardPracticeRecord>([
      [
        "c1",
        {
          card_id: "c1",
          last_confidence: 2,
          last_practiced_at: new Date().toISOString(),
          practice_count: 1
        }
      ]
    ]);

    const report = calculateRequirementMastery([reqMust, reqNice], [card1, card2], history);
    expect(report.requirements.length).toBe(2);
    expect(report.untouched_count).toBe(1);
    expect(report.needs_work_count).toBe(1);
    expect(report.weakest_requirement_ids).toContain("req_must");
  });
});
