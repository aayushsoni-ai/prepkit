import { z } from "zod";
import { GenerateOptions, LlmClient } from "./client.js";
import { buildRepairPrompt, parseAndValidateJson } from "./jsonOutput.js";
import { TokenBucketLimiter } from "./limiter.js";
import { executeWithRetry, HttpError } from "./retry.js";

export type MockHandler = (prompt: string, attempt: number) => Promise<string | object> | string | object;

export class MockLlmClient implements LlmClient {
  public callCount = 0;
  public promptsReceived: string[] = [];
  public limiter?: TokenBucketLimiter;
  private queuedResponses: Array<string | object | Error | MockHandler> = [];

  constructor(limiter?: TokenBucketLimiter) {
    this.limiter = limiter;
  }

  enqueue(response: string | object | Error | MockHandler): void {
    this.queuedResponses.push(response);
  }

  async generateJson<T>(schema: z.ZodType<T>, prompt: string, options?: GenerateOptions): Promise<T> {
    return executeWithRetry(async (attempt) => {
      this.callCount++;
      this.promptsReceived.push(prompt);

      if (this.limiter) {
        const estTokens = this.limiter.estimateTokens(prompt);
        await this.limiter.acquire(estTokens);
      }

      if (this.queuedResponses.length === 0) {
        throw new Error("MockLlmClient: No queued responses available");
      }

      const item = this.queuedResponses.shift()!;
      if (item instanceof Error) {
        throw item;
      }

      let rawContent: string;
      if (typeof item === "function") {
        const handled = await item(prompt, attempt);
        rawContent = typeof handled === "string" ? handled : JSON.stringify(handled);
      } else if (typeof item === "string") {
        rawContent = item;
      } else {
        rawContent = JSON.stringify(item);
      }

      const firstParse = parseAndValidateJson(rawContent, schema);
      if (firstParse.success) {
        return firstParse.data!;
      }

      if (this.queuedResponses.length > 0) {
        const repairPrompt = buildRepairPrompt(prompt, rawContent, firstParse.error!);
        this.promptsReceived.push(repairPrompt);
        this.callCount++;

        const repairItem = this.queuedResponses.shift()!;
        if (repairItem instanceof Error) throw repairItem;

        const repairedRaw = typeof repairItem === "string"
          ? repairItem
          : typeof repairItem === "function"
            ? JSON.stringify(await repairItem(repairPrompt, attempt))
            : JSON.stringify(repairItem);

        const repairParse = parseAndValidateJson(repairedRaw, schema);
        if (repairParse.success) {
          return repairParse.data!;
        }
      }

      throw new Error(`Model returned invalid JSON: ${firstParse.error}`);
    });
  }
}
