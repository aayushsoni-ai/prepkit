import { createHash } from "crypto";

export function normalizeJobDescription(jd: string): string {
  return jd.replace(/\s+/g, " ").trim().toLowerCase();
}

export function normalizeCompanyUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.hash = "";
    parsed.search = "";
    let normalized = `${parsed.protocol}//${parsed.hostname.toLowerCase()}`;
    if (parsed.port) {
      normalized += `:${parsed.port}`;
    }
    const cleanPath = parsed.pathname.replace(/\/+$/, "");
    normalized += cleanPath || "/";
    return normalized;
  } catch {
    return rawUrl.trim().toLowerCase();
  }
}

export function computeFingerprint(userId: string, jd: string, companyUrl: string): string {
  const normJd = normalizeJobDescription(jd);
  const normUrl = normalizeCompanyUrl(companyUrl);
  const payload = `${userId}:${normJd}:${normUrl}`;
  return createHash("sha256").update(payload).digest("hex");
}
