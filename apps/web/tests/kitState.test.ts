import { describe, expect, it } from "vitest";

describe("kit client state operations", () => {
  it("filters questions correctly by category", () => {
    const questions = [
      { id: "q1", category: "technical", question: "Explain event loops" },
      { id: "q2", category: "architecture", question: "Design an LRU cache" },
      { id: "q3", category: "technical", question: "Explain goroutines" }
    ];

    const tech = questions.filter((q) => q.category === "technical");
    expect(tech).toHaveLength(2);
    expect(tech.map((q) => q.id)).toEqual(["q1", "q3"]);
  });

  it("handles reordering within questions list", () => {
    const questions = [{ id: "q1" }, { id: "q2" }, { id: "q3" }];
    const activeIdx = questions.findIndex((q) => q.id === "q3");
    const overIdx = questions.findIndex((q) => q.id === "q1");

    const copy = [...questions];
    const [moved] = copy.splice(activeIdx, 1);
    copy.splice(overIdx, 0, moved);

    expect(copy.map((q) => q.id)).toEqual(["q3", "q1", "q2"]);
  });
});
