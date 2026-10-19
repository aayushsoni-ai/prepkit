import { describe, expect, it } from "vitest";
import { isPrivateAddress, validateUrl } from "../src/retrieval/urlGuard.js";

describe("urlGuard SSRF protection", () => {
  it("blocks private and loopback IPv4 addresses", () => {
    expect(isPrivateAddress("127.0.0.1")).toBe(true);
    expect(isPrivateAddress("10.0.0.1")).toBe(true);
    expect(isPrivateAddress("192.168.1.1")).toBe(true);
    expect(isPrivateAddress("172.16.0.1")).toBe(true);
    expect(isPrivateAddress("169.254.169.254")).toBe(true);
    expect(isPrivateAddress("0.0.0.0")).toBe(true);
  });

  it("blocks private and loopback IPv6 addresses", () => {
    expect(isPrivateAddress("::1")).toBe(true);
    expect(isPrivateAddress("::")).toBe(true);
    expect(isPrivateAddress("fe80::1")).toBe(true);
    expect(isPrivateAddress("fc00::1")).toBe(true);
  });

  it("allows public IPv4 addresses", () => {
    expect(isPrivateAddress("8.8.8.8")).toBe(false);
    expect(isPrivateAddress("1.1.1.1")).toBe(false);
    expect(isPrivateAddress("93.184.216.34")).toBe(false);
  });

  it("rejects non-http protocols", async () => {
    await expect(validateUrl("ftp://example.com/file")).rejects.toThrow("Forbidden protocol");
    await expect(validateUrl("file:///etc/passwd")).rejects.toThrow("Forbidden protocol");
    await expect(validateUrl("javascript:alert(1)")).rejects.toThrow("Forbidden protocol");
  });

  it("blocks localhost resolution when allowPrivate is false", async () => {
    await expect(validateUrl("http://localhost:8080", false)).rejects.toThrow("SSRF blocked");
    await expect(validateUrl("http://127.0.0.1:8080", false)).rejects.toThrow("SSRF blocked");
  });

  it("permits localhost when allowPrivate is true", async () => {
    const result = await validateUrl("http://127.0.0.1:8099/sites/acme/", true);
    expect(result.resolvedIp).toBe("127.0.0.1");
    expect(result.url.hostname).toBe("127.0.0.1");
  });
});
