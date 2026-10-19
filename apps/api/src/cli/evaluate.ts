import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { serializeKit } from "../domain/kit/serialize.js";
import { GeminiLlmClient } from "../llm/gemini.js";
import { GroqLlmClient } from "../llm/groq.js";
import { FallbackLlmClient, LlmClient } from "../llm/client.js";
import { TokenBucketLimiter } from "../llm/limiter.js";
import { computeFingerprint } from "../pipeline/fingerprint.js";
import { runPipeline } from "../pipeline/runPipeline.js";
import { parseCliArgs } from "./args.js";
import { BatchReportWriter } from "./report.js";
import { getEnv } from "../config/env.js";

interface RawCase {
  id: string;
  company_url: string;
  days: number;
  jd: string;
}

function resolveLlmClient(): LlmClient {
  const env = getEnv();
  const limiter = new TokenBucketLimiter({ rpm: env.LLM_RPM_BUDGET, tpm: env.LLM_TPM_BUDGET });

  const groqOptions = {
    apiKey: env.GROQ_API_KEY,
    heavyModel: env.GROQ_MODEL_HEAVY,
    lightModel: env.GROQ_MODEL_LIGHT,
    limiter
  };

  if (env.LLM_PROVIDER === "groq" && env.GROQ_API_KEY) {
    const groq = new GroqLlmClient(groqOptions);
    if (env.GEMINI_API_KEY) {
      const gemini = new GeminiLlmClient({ apiKey: env.GEMINI_API_KEY, limiter });
      return new FallbackLlmClient(groq, gemini);
    }
    return groq;
  }

  if (env.GEMINI_API_KEY) {
    const gemini = new GeminiLlmClient({ apiKey: env.GEMINI_API_KEY, limiter });
    if (env.GROQ_API_KEY) {
      const groq = new GroqLlmClient(groqOptions);
      return new FallbackLlmClient(gemini, groq);
    }
    return gemini;
  }

  return new GroqLlmClient({
    apiKey: env.GROQ_API_KEY || "dummy",
    heavyModel: env.GROQ_MODEL_HEAVY,
    lightModel: env.GROQ_MODEL_LIGHT,
    limiter
  });
}

export async function runEvaluate(rawArgs: string[] = process.argv.slice(2)): Promise<void> {
  const args = parseCliArgs(rawArgs);
  let inputAbs = resolve(process.cwd(), args.inputPath);
  if (!existsSync(inputAbs)) {
    const fallback = resolve(process.cwd(), args.inputPath.replace(/^apps\/api\//, ""));
    if (existsSync(fallback)) inputAbs = fallback;
  }
  let outputAbs = resolve(process.cwd(), args.outputPath);
  if (process.cwd().endsWith("apps/api") && args.outputPath.startsWith("apps/api/")) {
    outputAbs = resolve(process.cwd(), args.outputPath.replace(/^apps\/api\//, ""));
  }

  const fileData = await readFile(inputAbs, "utf-8");
  const cases: RawCase[] = JSON.parse(fileData);

  const env = getEnv();
  const concurrency = args.concurrency ?? env.EVAL_CONCURRENCY;
  const llm = resolveLlmClient();
  const writer = new BatchReportWriter(outputAbs);

  let activeIndex = 0;
  let okCount = 0;
  let failedCount = 0;

  async function worker(): Promise<void> {
    while (activeIndex < cases.length) {
      const currentIndex = activeIndex++;
      const item = cases[currentIndex];

      const result = await runPipeline(
        {
          id: item.id,
          jd: item.jd,
          company_url: item.company_url,
          days: item.days,
          userId: "batch_evaluator"
        },
        {
          llm,
          allowPrivateHosts: true,
          softBudgetMs: env.CASE_BUDGET_MS
        }
      );

      if (result.success) {
        okCount++;
        await writer.recordResult({
          id: item.id,
          status: "ok",
          kit: serializeKit(result.kit),
          error: null
        });
      } else {
        failedCount++;
        await writer.recordResult({
          id: item.id,
          status: "failed",
          kit: null,
          error: result.error
        });
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, cases.length) }, () => worker());
  await Promise.all(workers);

  console.log(`Evaluated ${cases.length} cases: ${okCount} ok, ${failedCount} failed`);
}

if (process.argv[1]?.endsWith("evaluate.ts")) {
  void runEvaluate();
}
