import { Kit } from "./schema.js";

export interface SerializedKit {
  id: string;
  company_name: string;
  role_title: string;
  company_url: string;
  days_available: number;
  brief: {
    summary: string;
    what_company_does: string;
    culture: string;
  };
  role: {
    title: string;
    level: string;
    requirements: Array<{
      id: string;
      text: string;
      evidence: string;
      priority: "must" | "nice";
      category: "technical" | "behavioural" | "system-design" | "company-fit";
    }>;
  };
  questions: Array<{
    id: string;
    category: "technical" | "behavioural" | "system-design" | "company-fit";
    question: string;
    guidance: string;
    difficulty: 1 | 2 | 3;
    requirement_ids: string[];
  }>;
  flashcards: Array<{
    id: string;
    front: string;
    back: string;
    requirement_ids: string[];
  }>;
  schedule: {
    days: Array<{
      day: number;
      phase: "learn" | "review";
      focus: string;
      minutes: number;
      question_ids: string[];
    }>;
  };
  coverage: {
    passes: number;
    must_have_total: number;
    must_have_covered: number;
    nice_to_have_total: number;
    nice_to_have_covered: number;
    uncovered_requirement_ids: string[];
  };
  research: {
    hiring_page_found: boolean;
    discussion_found: boolean;
    hiring_stages: string[];
    skipped_sources: Array<{ url: string; reason: string }>;
  };
  warnings: string[];
}

export function serializeKit(kit: Kit): SerializedKit {
  return {
    id: kit.id,
    company_name: kit.company_name,
    role_title: kit.role_title,
    company_url: kit.company_url,
    days_available: kit.days_available,
    brief: {
      summary: kit.brief.summary,
      what_company_does: kit.brief.what_company_does,
      culture: kit.brief.culture
    },
    role: {
      title: kit.role.title,
      level: kit.role.level,
      requirements: kit.role.requirements.map((req) => ({
        id: req.id,
        text: req.text,
        evidence: req.evidence,
        priority: req.priority,
        category: req.category
      }))
    },
    questions: kit.questions.map((q) => ({
      id: q.id,
      category: q.category,
      question: q.question,
      guidance: q.guidance,
      difficulty: q.difficulty,
      requirement_ids: [...q.requirement_ids]
    })),
    flashcards: kit.flashcards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      requirement_ids: [...card.requirement_ids]
    })),
    schedule: {
      days: kit.schedule.days.map((day) => ({
        day: day.day,
        phase: day.phase,
        focus: day.focus,
        minutes: day.minutes,
        question_ids: [...day.question_ids]
      }))
    },
    coverage: {
      passes: kit.coverage.passes,
      must_have_total: kit.coverage.must_have_total,
      must_have_covered: kit.coverage.must_have_covered,
      nice_to_have_total: kit.coverage.nice_to_have_total,
      nice_to_have_covered: kit.coverage.nice_to_have_covered,
      uncovered_requirement_ids: [...kit.coverage.uncovered_requirement_ids]
    },
    research: {
      hiring_page_found: kit.research.hiring_page_found,
      discussion_found: kit.research.discussion_found,
      hiring_stages: [...kit.research.hiring_stages],
      skipped_sources: kit.research.skipped_sources.map((s) => ({ ...s }))
    },
    warnings: [...kit.warnings]
  };
}
