import { lookup } from "dns/promises";
import { isIP } from "net";

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return true;
  const [a, b] = parts;
  if (a === 127) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 0 || a >= 224) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fe80:") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  return false;
}

export function isPrivateAddress(ip: string): boolean {
  const ipVersion = isIP(ip);
  if (ipVersion === 4) return isPrivateIpv4(ip);
  if (ipVersion === 6) return isPrivateIpv6(ip);
  return true;
}

export interface GuardedUrl {
  url: URL;
  resolvedIp: string;
}

export async function validateUrl(rawUrl: string, allowPrivate = false): Promise<GuardedUrl> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Forbidden protocol: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname;
  if (!hostname) {
    throw new Error("Missing hostname in URL");
  }

  if (allowPrivate && (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1")) {
    return { url: parsed, resolvedIp: "127.0.0.1" };
  }

  const addresses = await lookup(hostname, { all: true });
  if (addresses.length === 0) {
    throw new Error(`Could not resolve host: ${hostname}`);
  }

  for (const record of addresses) {
    if (!allowPrivate && isPrivateAddress(record.address)) {
      throw new Error(`SSRF blocked: host ${hostname} resolved to private/loopback IP ${record.address}`);
    }
  }

  return { url: parsed, resolvedIp: addresses[0].address };
}
