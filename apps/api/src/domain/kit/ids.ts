import { randomBytes } from "crypto";

export function createId(prefix: string): string {
  const suffix = randomBytes(8).toString("hex");
  return `${prefix}_${suffix}`;
}

export function createKitId(): string {
  return createId("kit");
}

export function createRequirementId(): string {
  return createId("req");
}

export function createQuestionId(): string {
  return createId("q");
}

export function createFlashcardId(): string {
  return createId("fc");
}
