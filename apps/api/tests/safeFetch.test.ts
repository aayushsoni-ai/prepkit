import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Server } from "http";
import { startFixtureServer, stopFixtureServer } from "../fixtures/serveFixtures.js";
import { safeFetch } from "../src/retrieval/safeFetch.js";

describe("safeFetch", () => {
  let server: Server;
  let serverPort: number;

  beforeAll(async () => {
    server = await startFixtureServer(0);
    serverPort = (server.address() as { port: number }).port;
  });

  afterAll(async () => {
    await stopFixtureServer(server);
  });

  it("fetches static HTML from fixture server with allowPrivate", async () => {
    const res = await safeFetch(`http://127.0.0.1:${serverPort}/sites/acme/index.html`, {
      allowPrivate: true
    });
    expect(res.status).toBe(200);
    expect(res.text).toContain("Acme Inc");
    expect(res.contentType).toContain("text/html");
  });

  it("enforces max response byte limits", async () => {
    await expect(
      safeFetch(`http://127.0.0.1:${serverPort}/sites/acme/index.html`, {
        allowPrivate: true,
        maxBytes: 20
      })
    ).rejects.toThrow("exceeded maximum size limit");
  });

  it("rejects private host fetching when allowPrivate is false", async () => {
    await expect(
      safeFetch(`http://127.0.0.1:${serverPort}/sites/acme/index.html`, {
        allowPrivate: false
      })
    ).rejects.toThrow("SSRF blocked");
  });
});
