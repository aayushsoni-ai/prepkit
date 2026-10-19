import { z } from "zod";

export const categorySchema = z.enum(["technical", "behavioural", "system-design", "company-fit"]);
export type Category = z.infer<typeof categorySchema>;

export const prioritySchema = z.enum(["must", "nice"]);
export type Priority = z.infer<typeof prioritySchema>;

export const itemStateSchema = z.object({
  origin: z.enum(["generated", "user"]),
  edited: z.boolean(),
  pinned: z.boolean(),
  updatedAt: z.string().datetime({ offset: true }).or(z.string())
});

export const requirementSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  evidence: z.string(),
  priority: prioritySchema,
  category: categorySchema
});
export type Requirement = z.infer<typeof requirementSchema>;

export const questionSchema = itemStateSchema.extend({
  id: z.string().min(1),
  category: categorySchema,
  question: z.string().min(1),
  guidance: z.string().min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  requirement_ids: z.array(z.string().min(1))
});
export type Question = z.infer<typeof questionSchema>;

export const flashcardSchema = itemStateSchema.extend({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  requirement_ids: z.array(z.string().min(1))
});
export type Flashcard = z.infer<typeof flashcardSchema>;

export const scheduleDaySchema = z.object({
  day: z.number().int().min(1),
  phase: z.enum(["learn", "review"]),
  focus: z.string(),
  minutes: z.number().int().min(0),
  question_ids: z.array(z.string().min(1))
});
export type ScheduleDay = z.infer<typeof scheduleDaySchema>;

export const coverageSchema = z.object({
  passes: z.number().int().min(1),
  must_have_total: z.number().int().min(0),
  must_have_covered: z.number().int().min(0),
  nice_to_have_total: z.number().int().min(0),
  nice_to_have_covered: z.number().int().min(0),
  uncovered_requirement_ids: z.array(z.string())
});
export type Coverage = z.infer<typeof coverageSchema>;

export const skippedSourceSchema = z.object({
  url: z.string(),
  reason: z.string()
});
export type SkippedSource = z.infer<typeof skippedSourceSchema>;

export const researchSchema = z.object({
  hiring_page_found: z.boolean(),
  discussion_found: z.boolean(),
  hiring_stages: z.array(z.string()),
  skipped_sources: z.array(skippedSourceSchema)
});
export type Research = z.infer<typeof researchSchema>;

export const briefSchema = itemStateSchema.extend({
  summary: z.string(),
  what_company_does: z.string(),
  culture: z.string()
});
export type Brief = z.infer<typeof briefSchema>;

export const kitSchema = z.object({
  id: z.string().min(1),
  company_name: z.string().min(1),
  role_title: z.string().min(1),
  company_url: z.string().url(),
  days_available: z.number().int().min(1).max(60),
  brief: briefSchema,
  role: z.object({
    title: z.string().min(1),
    level: z.string().default("mid"),
    requirements: z.array(requirementSchema)
  }),
  questions: z.array(questionSchema),
  flashcards: z.array(flashcardSchema),
  schedule: z.object({
    days: z.array(scheduleDaySchema)
  }),
  coverage: coverageSchema,
  research: researchSchema,
  warnings: z.array(z.string()),
  version: z.number().int().min(1)
});
export type Kit = z.infer<typeof kitSchema>;
