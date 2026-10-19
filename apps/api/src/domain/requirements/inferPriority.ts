import { Priority } from "../kit/schema.js";

const NICE_SIGNALS = [
  "nice to have",
  "a plus",
  "is a plus",
  "preferred",
  "bonus",
  "optional",
  "good to have",
  "advantage",
  "desired",
  "beneficial",
  "not required",
  "would be great"
];

export function inferPriority(text: string, evidence: string): Priority {
  const combined = `${text} ${evidence}`.toLowerCase();
  for (const signal of NICE_SIGNALS) {
    if (combined.includes(signal)) {
      return "nice";
    }
  }
  return "must";
}
