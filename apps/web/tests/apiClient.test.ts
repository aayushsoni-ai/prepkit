import { describe, expect, it } from "vitest";
import { ApiError } from "../src/lib/api/client";

describe("web api client error handling", () => {
  it("constructs ApiError with status, code, and message", () => {
    const error = new ApiError(404, "NOT_FOUND", "Resource missing", { id: "123" });
    expect(error.status).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("Resource missing");
    expect(error.details).toEqual({ id: "123" });
    expect(error.name).toBe("ApiError");
  });

  it("identifies unauthorized errors correctly", () => {
    const err = new ApiError(401, "UNAUTHORIZED", "Authentication required");
    expect(err.status).toBe(401);
  });
});
