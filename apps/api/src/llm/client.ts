import { z } from "zod";

export interface GenerateOptions {
  modelTier?: "heavy" | "light";
  systemInstruction?: string;
  temperature?: number;
}

export interface LlmClient {
  generateJson<T>(schema: z.ZodType<T>, prompt: string, options?: GenerateOptions): Promise<T>;
}

export class FallbackLlmClient implements LlmClient {
  private readonly primary: LlmClient;
  private readonly fallback?: LlmClient;

  constructor(primary: LlmClient, fallback?: LlmClient) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async generateJson<T>(schema: z.ZodType<T>, prompt: string, options?: GenerateOptions): Promise<T> {
    try {
      return await this.primary.generateJson(schema, prompt, options);
    } catch (primaryErr) {
      if (!this.fallback) {
        throw primaryErr;
      }
      return await this.fallback.generateJson(schema, prompt, options);
    }
  }
}
