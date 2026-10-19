import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Server } from "http";
import { request } from "undici";
import { createApp } from "../src/app.js";
import { KitsRepository } from "../src/persistence/repositories/kits.repo.js";
import { computeFingerprint } from "../src/pipeline/fingerprint.js";
import { KitsService } from "../src/services/kits.service.js";
import { RegenerationService } from "../src/services/regeneration.service.js";
import { createTestKit } from "./testKitHelper.js";

describe("api and persistence integration", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const port = (server.address() as { port: number }).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("enforces authentication boundaries and returns 401 for unauthorized requests", async () => {
    const unauthRes = await request(`${baseUrl}/api/auth/me`);
    expect(unauthRes.statusCode).toBe(401);

    const regRes = await request(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user_a@example.com", password: "Password123!" })
    });

    expect(regRes.statusCode).toBe(201);
    const setCookie = regRes.headers["set-cookie"] as string | string[];
    const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    expect(cookieHeader).toContain("prepkit_session");

    const sessionCookie = cookieHeader.split(";")[0];
    const meRes = await request(`${baseUrl}/api/auth/me`, { headers: { Cookie: sessionCookie } });
    expect(meRes.statusCode).toBe(200);

    const logoutRes = await request(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie }
    });
    expect(logoutRes.statusCode).toBe(200);

    const afterLogout = await request(`${baseUrl}/api/auth/me`, { headers: { Cookie: sessionCookie } });
    expect(afterLogout.statusCode).toBe(401);
  });

  it("scopes kit access by userId and returns 404 for other user kits", async () => {
    const kitsRepo = new KitsRepository();
    const kitA = createTestKit("kit_user_a");

    await kitsRepo.create({
      _id: "kit_user_a",
      user_id: "user_a_id",
      fingerprint: "fp_a",
      kit: kitA,
      updated_at: new Date().toISOString()
    });

    const regB = await request(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user_b@example.com", password: "Password123!" })
    });
    const cookieB = (regB.headers["set-cookie"] as string).split(";")[0];

    const getRes = await request(`${baseUrl}/api/kits/kit_user_a`, { headers: { Cookie: cookieB } });
    expect(getRes.statusCode).toBe(404);
  });

  it("returns existing kit for duplicate submission with same fingerprint", async () => {
    const kitsService = new KitsService();
    const input = {
      jd: "Software Engineer with 5 years experience in Go and distributed systems.",
      company_url: "https://golang.example.com",
      days: 3
    };

    const first = await kitsService.createKit("user_dedup_test", input);
    const kitsRepo = new KitsRepository();
    const fp = computeFingerprint("user_dedup_test", input.jd, input.company_url);
    await kitsRepo.create({
      _id: first.kitId,
      user_id: "user_dedup_test",
      fingerprint: fp,
      kit: createTestKit(first.kitId),
      updated_at: new Date().toISOString()
    });

    const second = await kitsService.createKit("user_dedup_test", input);
    expect(second.existing).toBe(true);
    expect(second.kitId).toBe(first.kitId);
  });

  it("preserves edited questions through regeneration and supports undo", async () => {
    const kitsRepo = new KitsRepository();
    const regenService = new RegenerationService();
    const kitsService = new KitsService();

    const kitId = "kit_regen_test";
    const userId = "user_regen_test";
    const q1 = {
      id: "q1",
      category: "technical" as const,
      question: "Original Q1",
      guidance: "G1",
      difficulty: 2 as const,
      requirement_ids: [],
      origin: "generated" as const,
      edited: false,
      pinned: false,
      updatedAt: new Date().toISOString()
    };

    await kitsRepo.create({
      _id: kitId,
      user_id: userId,
      fingerprint: "fp_regen",
      kit: createTestKit(kitId, [q1]),
      updated_at: new Date().toISOString()
    });

    await kitsService.patchQuestion(kitId, userId, "q1", { question: "Custom edited title" }, 1);

    const regenerated = await regenService.regenerateCategory(kitId, userId, "technical", 2);
    expect(regenerated).toBeDefined();
    expect(regenerated?.questions.some((q) => q.id === "q1" && q.question === "Custom edited title")).toBe(true);

    const undone = await regenService.undo(kitId, userId);
    expect(undone).toBeDefined();
    expect(undone?.version).toBeGreaterThan(2);
  });
});
