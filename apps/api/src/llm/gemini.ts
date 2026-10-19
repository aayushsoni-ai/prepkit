import { request } from "undici";
import { z } from "zod";
import { GenerateOptions, LlmClient } from "./client.js";
import { buildRepairPrompt, parseAndValidateJson } from "./jsonOutput.js";
import { TokenBucketLimiter } from "./limiter.js";
import { executeWithRetry, HttpError } from "./retry.js";

export interface GeminiClientOptions {
  apiKey: string;
  heavyModel?: string;
  lightModel?: string;
  limiter?: TokenBucketLimiter;
}

export class GeminiLlmClient implements LlmClient {
  private readonly apiKey: string;
  private readonly heavyModel: string;
  private readonly lightModel: string;
  private readonly limiter?: TokenBucketLimiter;

  constructor(options: GeminiClientOptions) {
    this.apiKey = options.apiKey;
    this.heavyModel = options.heavyModel ?? "gemini-2.5-pro";
    this.lightModel = options.lightModel ?? "gemini-2.5-flash";
    this.limiter = options.limiter;
  }

  private async callGeminiApi(prompt: string, model: string, systemInstruction?: string): Promise<string> {
    const payload: {
      contents: Array<{ parts: Array<{ text: string }> }>;
      generationConfig: { responseMimeType: string; temperature: number };
      systemInstruction?: { parts: Array<{ text: string }> };
    } = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
    };

    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    if (this.limiter) {
      const tokens = this.limiter.estimateTokens(prompt);
      await this.limiter.acquire(tokens);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    const res = await request(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.statusCode < 200 || res.statusCode >= 300) {
      const errBody = await res.body.text();
      const err = new Error(`Gemini API error (${res.statusCode}): ${errBody}`) as HttpError;
      err.statusCode = res.statusCode;
      const retryHeader = res.headers["retry-after"];
      if (typeof retryHeader === "string") {
        err.retryAfterSeconds = parseFloat(retryHeader);
      }
      throw err;
    }

    const data = (await res.body.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini API returned empty text parts");
    }

    return text;
  }

  async generateJson<T>(schema: z.ZodType<T>, prompt: string, options?: GenerateOptions): Promise<T> {
    const model = options?.modelTier === "light" ? this.lightModel : this.heavyModel;

    return executeWithRetry(async () => {
      const rawOutput = await this.callGeminiApi(prompt, model, options?.systemInstruction);
      const parsed = parseAndValidateJson(rawOutput, schema);

      if (parsed.success) {
        return parsed.data!;
      }

      const repairPrompt = buildRepairPrompt(prompt, rawOutput, parsed.error!);
      const repairedOutput = await this.callGeminiApi(repairPrompt, model, options?.systemInstruction);
      const repairedParse = parseAndValidateJson(repairedOutput, schema);

      if (repairedParse.success) {
        return repairedParse.data!;
      }

      throw new Error(`Gemini returned invalid JSON after repair: ${parsed.error}`);
    });
  }
}
