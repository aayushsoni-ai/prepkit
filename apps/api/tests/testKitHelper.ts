import { Kit } from "../src/domain/kit/schema.js";

export function createTestKit(id: string, questions: Kit["questions"] = []): Kit {
  return {
    id,
    company_name: "TestCorp",
    role_title: "Engineer",
    company_url: "https://test.example.com",
    days_available: 2,
    brief: {
      summary: "Brief",
      what_company_does: "Tech",
      culture: "Culture",
      origin: "generated",
      edited: false,
      pinned: false,
      updatedAt: new Date().toISOString()
    },
    role: { title: "Engineer", level: "mid", requirements: [] },
    questions,
    flashcards: [],
    schedule: { days: [] },
    coverage: { passes: 1, must_have_total: 0, must_have_covered: 0, nice_to_have_total: 0, nice_to_have_covered: 0, uncovered_requirement_ids: [] },
    research: { hiring_page_found: false, discussion_found: false, hiring_stages: [], skipped_sources: [] },
    warnings: [],
    version: 1
  };
}
