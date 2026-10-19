const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: unknown = null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include"
  });

  if (response.status === 304) {
    return { notModified: true } as unknown as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data?.error;
    throw new ApiError(
      response.status,
      error?.code || "REQUEST_FAILED",
      error?.message || response.statusText,
      error?.details
    );
  }

  return data as T;
}

export const api = {
  auth: {
    me: () => request<{ user: { id: string; email: string } }>("/api/auth/me"),
    login: (body: { email: string; password: string }) =>
      request<{ user: { id: string; email: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    register: (body: { email: string; password: string }) =>
      request<{ user: { id: string; email: string } }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    logout: () =>
      request<{ success: boolean }>("/api/auth/logout", { method: "POST" })
  },
  kits: {
    list: () => request<{ kits: unknown[] }>("/api/kits"),
    get: (id: string) => request<{ kit: any; version: number }>(`/api/kits/${id}`),
    create: (body: { jd: string; company_url: string; days: number }) =>
      request<{ kitId: string; jobId?: string; existing: boolean }>("/api/kits", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    patchQuestion: (kitId: string, qId: string, updates: Record<string, unknown>, expectedVersion: number) =>
      request<{ success: boolean }>(`/api/kits/${kitId}/questions/${qId}`, {
        method: "PATCH",
        body: JSON.stringify({ updates, expectedVersion })
      }),
    addQuestion: (kitId: string, body: Record<string, unknown>) =>
      request<{ success: boolean }>(`/api/kits/${kitId}/questions`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    deleteQuestion: (kitId: string, qId: string, expectedVersion: number) =>
      request<{ success: boolean }>(`/api/kits/${kitId}/questions/${qId}`, {
        method: "DELETE",
        body: JSON.stringify({ expectedVersion })
      }),
    regenerate: (kitId: string, body: { section?: string; category?: string; expectedVersion: number }) =>
      request<{ kit: any; version: number }>(`/api/kits/${kitId}/regenerate`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    undo: (kitId: string) =>
      request<{ kit: any; version: number }>(`/api/kits/${kitId}/undo`, {
        method: "POST"
      })
  },
  jobs: {
    get: (id: string, etag?: string) =>
      request<{ job: any; notModified?: boolean }>(`/api/jobs/${id}`, {
        headers: etag ? { "If-None-Match": etag } : undefined
      }),
    resume: (id: string) =>
      request<{ resumed: boolean }>(`/api/jobs/${id}/resume`, { method: "POST" })
  },
  practice: {
    rate: (cardId: string, confidence: number) =>
      request<{ success: boolean }>("/api/practice/rate", {
        method: "POST",
        body: JSON.stringify({ cardId, confidence })
      }),
    queue: (kitId: string, limit = 10, filterReqIds?: string[]) => {
      const q = new URLSearchParams({ limit: String(limit) });
      if (filterReqIds?.length) q.set("filterReqIds", filterReqIds.join(","));
      return request<{ queue: any[] }>(`/api/practice/${kitId}/queue?${q.toString()}`);
    },
    mastery: (kitId: string) =>
      request<{ report: any }>(`/api/practice/${kitId}/mastery`)
  }
};
