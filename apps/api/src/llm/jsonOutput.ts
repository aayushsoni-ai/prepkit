import { z } from "zod";

export function tolerantJsonExtract(raw: string): string {
  let cleaned = raw.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");

  let start = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    start = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    start = firstBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
  }

  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  return cleaned.replace(/,\s*([}\]])/g, "$1");
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  extractedText?: string;
}

export function parseAndValidateJson<T>(rawText: string, schema: z.ZodType<T>): ParseResult<T> {
  const extracted = tolerantJsonExtract(rawText);

  let parsedObject: unknown;
  try {
    parsedObject = JSON.parse(extracted);
  } catch (err) {
    return {
      success: false,
      error: `Syntax error parsing JSON: ${(err as Error).message}`,
      extractedText: extracted
    };
  }

  const validation = schema.safeParse(parsedObject);
  if (!validation.success) {
    const errorDetails = validation.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return {
      success: false,
      error: `Schema validation failed: ${errorDetails}`,
      extractedText: extracted
    };
  }

  return {
    success: true,
    data: validation.data
  };
}

export function buildRepairPrompt(originalPrompt: string, failedOutput: string, validationError: string): string {
  return [
    originalPrompt,
    "\nYour previous response failed validation with the following errors:",
    validationError,
    "\nPrevious invalid output:",
    failedOutput,
    "\nRespond with strictly corrected, valid JSON matching the requested schema."
  ].join("\n");
}
