import { describe, expect, it } from "vitest";
import { countKeptAndReplaced, markEdited, markUserItem, togglePinned } from "../src/domain/regeneration/itemState.js";
import { mergeRegeneratedFlashcards, mergeRegeneratedQuestions } from "../src/domain/regeneration/mergeRegenerated.js";
import { Flashcard, Question } from "../src/domain/kit/schema.js";

function createQuestion(id: string, origin: "generated" | "user" = "generated"): Question {
  return {
    id,
    category: "technical",
    question: `Original text ${id}`,
    guidance: `Guidance ${id}`,
    difficulty: 2,
    requirement_ids: ["req_1"],
    origin,
    edited: false,
    pinned: false,
    updatedAt: new Date().toISOString()
  };
}

describe("regeneration merge and item protection", () => {
  it("counts kept and replaced items correctly", () => {
    const q1 = createQuestion("q1", "generated");
    const q2 = markUserItem(createQuestion("q2"));
    const q3 = togglePinned(createQuestion("q3", "generated"));

    const counts = countKeptAndReplaced([q1, q2, q3]);
    expect(counts.kept).toBe(2);
    expect(counts.replaced).toBe(1);
  });

  it("preserves user-created, edited, and pinned items across regeneration", () => {
    const qUser = markUserItem(createQuestion("q_user"));
    const qEdited = markEdited(createQuestion("q_edited"), { question: "Custom edited title" });
    const qPinned = togglePinned(createQuestion("q_pinned"));
    const qGenerated = createQuestion("q_old_gen");

    const currentQuestions = [qUser, qGenerated, qEdited, qPinned];

    const newIncoming = [
      createQuestion("q_new_1"),
      createQuestion("q_new_2")
    ];

    const merged = mergeRegeneratedQuestions(currentQuestions, "technical", newIncoming);

    expect(merged.some((q) => q.id === "q_user")).toBe(true);
    expect(merged.some((q) => q.id === "q_edited" && q.question === "Custom edited title")).toBe(true);
    expect(merged.some((q) => q.id === "q_pinned")).toBe(true);
    expect(merged.some((q) => q.id === "q_old_gen")).toBe(false);
    expect(merged.some((q) => q.id === "q_new_1")).toBe(true);
  });

  it("handles edits that land mid-regeneration against latest stored state", () => {
    const q1 = createQuestion("q1");
    const q2 = createQuestion("q2");
    const q3 = createQuestion("q3");

    let latestStoredState = [q1, q2, q3];

    const incomingRegen = [
      createQuestion("q_fresh_1"),
      createQuestion("q_fresh_2"),
      createQuestion("q_fresh_3")
    ];

    latestStoredState = [
      q1,
      markEdited(q2, { question: "User typed this while regen was running" }),
      q3
    ];

    const result = mergeRegeneratedQuestions(latestStoredState, "technical", incomingRegen);

    const survivingEdited = result.find((q) => q.id === "q2");
    expect(survivingEdited).toBeDefined();
    expect(survivingEdited?.question).toBe("User typed this while regen was running");
    expect(survivingEdited?.edited).toBe(true);
  });

  it("preserves protected flashcards during regeneration", () => {
    const card1: Flashcard = {
      id: "fc_1",
      front: "Front 1",
      back: "Back 1",
      requirement_ids: ["r1"],
      origin: "generated",
      edited: false,
      pinned: true,
      updatedAt: new Date().toISOString()
    };
    const card2: Flashcard = {
      id: "fc_2",
      front: "Front 2",
      back: "Back 2",
      requirement_ids: ["r1"],
      origin: "generated",
      edited: false,
      pinned: false,
      updatedAt: new Date().toISOString()
    };

    const newCards: Flashcard[] = [
      {
        id: "fc_new",
        front: "Front New",
        back: "Back New",
        requirement_ids: ["r1"],
        origin: "generated",
        edited: false,
        pinned: false,
        updatedAt: new Date().toISOString()
      }
    ];

    const merged = mergeRegeneratedFlashcards([card1, card2], newCards);
    expect(merged.some((c) => c.id === "fc_1")).toBe(true);
    expect(merged.some((c) => c.id === "fc_2")).toBe(false);
    expect(merged.some((c) => c.id === "fc_new")).toBe(true);
  });
});
