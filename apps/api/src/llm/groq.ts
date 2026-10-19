import { request } from "undici";
import { z } from "zod";
import { GenerateOptions, LlmClient } from "./client.js";
import { buildRepairPrompt, parseAndValidateJson } from "./jsonOutput.js";
import { TokenBucketLimiter } from "./limiter.js";
import { executeWithRetry, HttpError } from "./retry.js";

export interface GroqClientOptions {
  apiKey: string;
  heavyModel?: string;
  lightModel?: string;
  limiter?: TokenBucketLimiter;
}

export class GroqLlmClient implements LlmClient {
  private readonly apiKey: string;
  private readonly heavyModel: string;
  private readonly lightModel: string;
  private readonly limiter?: TokenBucketLimiter;

  constructor(options: GroqClientOptions) {
    this.apiKey = options.apiKey;
    this.heavyModel = options.heavyModel ?? "llama-3.3-70b-versatile";
    this.lightModel = options.lightModel ?? "llama-3.1-8b-instant";
    this.limiter = options.limiter;
  }

  private async callGroqApi(prompt: string, model: string, systemInstruction?: string): Promise<string> {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const payload = JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    if (this.limiter) {
      const tokens = this.limiter.estimateTokens(prompt);
      await this.limiter.acquire(tokens);
    }

    const res = await request("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: payload
    });

    if (res.statusCode < 200 || res.statusCode >= 300) {
      const errBody = await res.body.text();
      const err = new Error(`Groq API error (${res.statusCode}): ${errBody}`) as HttpError;
      err.statusCode = res.statusCode;
      const retryHeader = res.headers["retry-after"];
      if (typeof retryHeader === "string") {
        err.retryAfterSeconds = parseFloat(retryHeader);
      }
      throw err;
    }

    const data = (await res.body.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Groq API returned empty response choices");
    }

    return content;
  }

  async generateJson<T>(schema: z.ZodType<T>, prompt: string, options?: GenerateOptions): Promise<T> {
    const model = options?.modelTier === "light" ? this.lightModel : this.heavyModel;

    return executeWithRetry(async () => {
      const rawOutput = await this.callGroqApi(prompt, model, options?.systemInstruction);
      const parsed = parseAndValidateJson(rawOutput, schema);

      if (parsed.success) {
        return parsed.data!;
      }

      const repairPrompt = buildRepairPrompt(prompt, rawOutput, parsed.error!);
      const repairedOutput = await this.callGroqApi(repairPrompt, model, options?.systemInstruction);
      const repairedParse = parseAndValidateJson(repairedOutput, schema);

      if (repairedParse.success) {
        return repairedParse.data!;
      }

      throw new Error(`Groq returned invalid JSON after repair: ${parsed.error}`);
    });
  }
}
