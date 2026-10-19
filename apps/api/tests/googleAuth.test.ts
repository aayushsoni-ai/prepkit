import { describe, expect, it } from "vitest";
import { AuthService } from "../src/services/auth.service.js";
import { UsersRepository } from "../src/persistence/repositories/users.repo.js";

describe("Google OAuth authService integration", () => {
  it("creates a new user when authenticating with a new googleId and email", async () => {
    const authService = new AuthService();
    const googleId = "google_test_123456";
    const email = "googleuser@example.com";

    const { user, rawToken } = await authService.handleGoogleAuth(googleId, email);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(email);
    expect(rawToken).toBeDefined();

    const validated = await authService.validateSession(rawToken);
    expect(validated?.id).toBe(user.id);
    expect(validated?.email).toBe(email);
  });

  it("links googleId when a user with the same email already exists", async () => {
    const authService = new AuthService();
    const usersRepo = new UsersRepository();
    const email = "existing_oauth@example.com";

    const registered = await authService.register(email, "secretpassword123");
    expect(registered.user.id).toBeDefined();

    const googleId = "google_linked_987654";
    const oauthResult = await authService.handleGoogleAuth(googleId, email);

    expect(oauthResult.user.id).toBe(registered.user.id);
    expect(oauthResult.user.email).toBe(email);

    const fromDb = await usersRepo.findByGoogleId(googleId);
    expect(fromDb?.id).toBe(registered.user.id);
  });
});
