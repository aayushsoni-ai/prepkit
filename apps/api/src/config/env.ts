import { existsSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
import { z } from "zod";

const envFiles = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../.env"),
  resolve(process.cwd(), "../../.env")
];

for (const f of envFiles) {
  if (existsSync(f)) {
    config({ path: f });
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/prepkit"),
  SESSION_SECRET: z.string().min(16).default("fallback-secret-for-development-must-be-long-enough"),
  SESSION_TTL_DAYS: z.coerce.number().default(7),
  LLM_PROVIDER: z.enum(["gemini", "groq", "mock"]).default("gemini"),
  GEMINI_API_KEY: z.string().default(""),
  GEMINI_MODEL_HEAVY: z.string().default("gemini-2.5-pro"),
  GEMINI_MODEL_LIGHT: z.string().default("gemini-2.5-flash"),
  GROQ_API_KEY: z.string().default(""),
  GROQ_MODEL_HEAVY: z.string().default("openai/gpt-oss-120b"),
  GROQ_MODEL_LIGHT: z.string().default("openai/gpt-oss-20b"),
  LLM_TPM_BUDGET: z.coerce.number().default(1000000),
  LLM_RPM_BUDGET: z.coerce.number().default(15),
  LLM_MAX_RETRIES: z.coerce.number().default(3),
  SEARCH_PROVIDER: z.enum(["hackernews", "brave"]).default("hackernews"),
  BRAVE_API_KEY: z.string().default(""),
  ALLOW_PRIVATE_HOSTS: z.preprocess((val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
    return false;
  }, z.boolean()).default(false),
  CRAWL_MAX_PAGES: z.coerce.number().default(6),
  CRAWL_DELAY_MS: z.coerce.number().default(500),
  FETCH_TIMEOUT_MS: z.coerce.number().default(8000),
  FETCH_MAX_BYTES: z.coerce.number().default(1048576),
  CASE_BUDGET_MS: z.coerce.number().default(180000),
  EVAL_CONCURRENCY: z.coerce.number().default(2),
  API_ORIGIN: z.string().default("http://localhost:4000")
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

export function getEnv(): Env {
  return env;
}
