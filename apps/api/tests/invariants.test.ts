import { describe, expect, it } from "vitest";
import { assertKitInvariants, validateKitInvariants } from "../src/domain/kit/invariants.js";
import { Kit, kitSchema } from "../src/domain/kit/schema.js";
import { serializeKit } from "../src/domain/kit/serialize.js";

function createValidKit(): Kit {
  return {
    id: "kit_123",
    company_name: "Acme Corp",
    role_title: "Staff Engineer",
    company_url: "https://acme.example.com",
    days_available: 2,
    brief: {
      summary: "Acme builds tools.",
      what_company_does: "Developer tools.",
      culture: "Engineering-first culture.",
      origin: "generated",
      edited: false,
      pinned: false,
      updatedAt: new Date().toISOString()
    },
    role: {
      title: "Staff Engineer",
      level: "staff",
      requirements: [
        {
          id: "req_1",
          text: "TypeScript proficiency",
          evidence: "Requires deep TypeScript knowledge",
          priority: "must",
          category: "technical"
        }
      ]
    },
    questions: [
      {
        id: "q_1",
        category: "technical",
        question: "Explain conditional types",
        guidance: "Mention distributive properties",
        difficulty: 2,
        requirement_ids: ["req_1"],
        origin: "generated",
        edited: false,
        pinned: false,
        updatedAt: new Date().toISOString()
      }
    ],
    flashcards: [
      {
        id: "fc_1",
        front: "What is infer?",
        back: "Keyword to introduce type variable",
        requirement_ids: ["req_1"],
        origin: "generated",
        edited: false,
        pinned: false,
        updatedAt: new Date().toISOString()
      }
    ],
    schedule: {
      days: [
        {
          day: 1,
          phase: "learn",
          focus: "Technical: TypeScript proficiency",
          minutes: 25,
          question_ids: ["q_1"]
        },
        {
          day: 2,
          phase: "review",
          focus: "Review: TypeScript proficiency",
          minutes: 25,
          question_ids: ["q_1"]
        }
      ]
    },
    coverage: {
      passes: 1,
      must_have_total: 1,
      must_have_covered: 1,
      nice_to_have_total: 0,
      nice_to_have_covered: 0,
      uncovered_requirement_ids: []
    },
    research: {
      hiring_page_found: true,
      discussion_found: false,
      hiring_stages: ["Technical screen"],
      skipped_sources: []
    },
    warnings: [],
    version: 1
  };
}

describe("kit invariants and schema", () => {
  it("validates a healthy kit shape", () => {
    const kit = createValidKit();
    expect(kitSchema.safeParse(kit).success).toBe(true);
    const inv = validateKitInvariants(kit);
    expect(inv.valid).toBe(true);
    expect(inv.errors.length).toBe(0);
  });

  it("rejects duplicate requirement ids", () => {
    const kit = createValidKit();
    kit.role.requirements.push({ ...kit.role.requirements[0] });
    const inv = validateKitInvariants(kit);
    expect(inv.valid).toBe(false);
    expect(inv.errors.some((e) => e.includes("Duplicate requirement id"))).toBe(true);
  });

  it("rejects questions referencing non-existent requirements", () => {
    const kit = createValidKit();
    kit.questions[0].requirement_ids = ["non_existent_req"];
    const inv = validateKitInvariants(kit);
    expect(inv.valid).toBe(false);
    expect(inv.errors.some((e) => e.includes("non-existent requirement"))).toBe(true);
  });

  it("rejects schedule day count mismatch", () => {
    const kit = createValidKit();
    kit.days_available = 3;
    const inv = validateKitInvariants(kit);
    expect(inv.valid).toBe(false);
    expect(inv.errors.some((e) => e.includes("does not match days_available"))).toBe(true);
    expect(() => assertKitInvariants(kit)).toThrow();
  });

  it("rejects non-integer minutes", () => {
    const kit = createValidKit();
    kit.schedule.days[0].minutes = 15.5;
    const inv = validateKitInvariants(kit);
    expect(inv.valid).toBe(false);
    expect(inv.errors.some((e) => e.includes("non-negative integer"))).toBe(true);
  });

  it("serializeKit strips internal item metadata", () => {
    const kit = createValidKit();
    const serialized = serializeKit(kit);
    expect(serialized.id).toBe(kit.id);
    expect((serialized.questions[0] as unknown as { origin?: string }).origin).toBeUndefined();
    expect((serialized.flashcards[0] as unknown as { edited?: boolean }).edited).toBeUndefined();
    expect((serialized as unknown as { version?: number }).version).toBeUndefined();
  });
});
