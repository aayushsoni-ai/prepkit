import { request } from "undici";
import { validateUrl } from "./urlGuard.js";

const ACCEPTABLE_CONTENT_TYPES = [
  "text/html",
  "application/xhtml+xml",
  "text/plain",
  "application/xml",
  "text/xml"
];

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  allowPrivate?: boolean;
  userAgent?: string;
  maxRedirects?: number;
}

export interface SafeFetchResult {
  url: string;
  status: number;
  contentType: string;
  text: string;
}

export async function safeFetch(
  rawUrl: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult> {
  const timeoutMs = options.timeoutMs ?? 8000;
  const maxBytes = options.maxBytes ?? 1048576;
  const allowPrivate = options.allowPrivate ?? false;
  const userAgent = options.userAgent ?? "PrepkitBot";
  const maxRedirects = options.maxRedirects ?? 3;

  let currentUrl = rawUrl;
  let redirectsFollowed = 0;

  while (redirectsFollowed <= maxRedirects) {
    const { url: validatedUrl } = await validateUrl(currentUrl, allowPrivate);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await request(validatedUrl.toString(), {
        method: "GET",
        headers: {
          "user-agent": userAgent,
          accept: "text/html,application/xhtml+xml,text/plain,application/xml;q=0.9,*/*;q=0.8"
        },
        signal: controller.signal
      });

      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        redirectsFollowed++;
        if (redirectsFollowed > maxRedirects) {
          throw new Error(`Exceeded maximum redirect limit of ${maxRedirects}`);
        }
        const location = Array.isArray(response.headers.location)
          ? response.headers.location[0]
          : response.headers.location;
        currentUrl = new URL(location, validatedUrl).toString();
        continue;
      }

      const contentTypeHeader = (response.headers["content-type"] as string | undefined) || "";
      const primaryContentType = contentTypeHeader.split(";")[0].trim().toLowerCase();

      const isAllowed = ACCEPTABLE_CONTENT_TYPES.some((allowed) =>
        primaryContentType.includes(allowed)
      );

      if (!isAllowed && primaryContentType.length > 0) {
        throw new Error(`Unsupported content type: ${primaryContentType}`);
      }

      let bytesRead = 0;
      const chunks: Buffer[] = [];

      for await (const chunk of response.body) {
        bytesRead += chunk.length;
        if (bytesRead > maxBytes) {
          throw new Error(`Response exceeded maximum size limit of ${maxBytes} bytes`);
        }
        chunks.push(chunk as Buffer);
      }

      const fullText = Buffer.concat(chunks).toString("utf-8");

      return {
        url: validatedUrl.toString(),
        status: response.statusCode,
        contentType: primaryContentType,
        text: fullText
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(`Exceeded redirect limit of ${maxRedirects}`);
}
