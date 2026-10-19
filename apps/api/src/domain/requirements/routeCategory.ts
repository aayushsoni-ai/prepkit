import { Category } from "../kit/schema.js";

const SYSTEM_DESIGN_SIGNALS = [
  "system design",
  "distributed system",
  "architecture",
  "architectural",
  "scalability",
  "high throughput",
  "high availability",
  "microservices",
  "infrastructure",
  "cloud architecture",
  "data pipeline"
];

const BEHAVIOURAL_SIGNALS = [
  "mentor",
  "mentoring",
  "leadership",
  "collaborat",
  "communication",
  "stakeholder",
  "cross-functional",
  "team player",
  "empathy",
  "interpersonal",
  "ownership",
  "influence"
];

const COMPANY_FIT_SIGNALS = [
  "mission",
  "culture",
  "values",
  "domain knowledge",
  "passion for",
  "industry experience",
  "customer centric",
  "user focused"
];

export function routeCategory(text: string, hiringStages: string[] = []): Category {
  const normalized = text.toLowerCase();

  const hasHiringSystemDesign = hiringStages.some((stage) =>
    stage.toLowerCase().includes("system design") || stage.toLowerCase().includes("architecture")
  );

  for (const signal of SYSTEM_DESIGN_SIGNALS) {
    if (normalized.includes(signal)) {
      return "system-design";
    }
  }

  if (hasHiringSystemDesign && (normalized.includes("scale") || normalized.includes("backend") || normalized.includes("database"))) {
    return "system-design";
  }

  for (const signal of BEHAVIOURAL_SIGNALS) {
    if (normalized.includes(signal)) {
      return "behavioural";
    }
  }

  for (const signal of COMPANY_FIT_SIGNALS) {
    if (normalized.includes(signal)) {
      return "company-fit";
    }
  }

  return "technical";
}

export function determineActiveCategories(categories: Category[], hiringStages: string[] = []): Category[] {
  const set = new Set<Category>(categories);
  const hasSystemDesignStage = hiringStages.some((stage) =>
    stage.toLowerCase().includes("system design")
  );
  if (hasSystemDesignStage) {
    set.add("system-design");
  }
  return Array.from(set);
}
