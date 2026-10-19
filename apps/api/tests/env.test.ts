import { describe, expect, it } from "vitest";
import { env, getEnv } from "../src/config/env.js";

describe("env configuration", () => {
  it("loads default environment variables", () => {
    expect(env.PORT).toBeDefined();
    expect(typeof env.PORT).toBe("number");
    expect(env.LLM_PROVIDER).toMatch(/gemini|groq|mock/);
    expect(env.SEARCH_PROVIDER).toMatch(/hackernews|brave/);
  });

  it("returns env from getEnv", () => {
    const current = getEnv();
    expect(current).toBe(env);
  });
});
