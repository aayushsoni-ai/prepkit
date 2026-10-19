import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { createId } from "../domain/kit/ids.js";
import { ConflictError, UnauthorizedError } from "../http/middleware/errors.js";
import { SessionsRepository } from "../persistence/repositories/sessions.repo.js";
import { UsersRepository } from "../persistence/repositories/users.repo.js";

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export class AuthService {
  private readonly usersRepo = new UsersRepository();
  private readonly sessionsRepo = new SessionsRepository();

  async register(email: string, password: string): Promise<{ user: { id: string; email: string }; rawToken: string }> {
    const existing = await this.usersRepo.findByEmail(email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = createId("usr");

    const user = await this.usersRepo.create({
      id: userId,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    });

    const rawToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.sessionsRepo.create({
      id: createId("sess"),
      token_hash: hashToken(rawToken),
      user_id: user.id,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    });

    return { user: { id: user.id, email: user.email }, rawToken };
  }

  async login(email: string, password: string): Promise<{ user: { id: string; email: string }; rawToken: string }> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const rawToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.sessionsRepo.create({
      id: createId("sess"),
      token_hash: hashToken(rawToken),
      user_id: user.id,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    });

    return { user: { id: user.id, email: user.email }, rawToken };
  }

  async validateSession(rawToken: string): Promise<{ id: string; email: string } | null> {
    if (!rawToken) return null;
    const tokenHash = hashToken(rawToken);
    const session = await this.sessionsRepo.findByTokenHash(tokenHash);

    if (!session || new Date() > new Date(session.expires_at)) {
      return null;
    }

    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.sessionsRepo.updateExpiry(tokenHash, newExpiry);

    const user = await this.usersRepo.findById(session.user_id);
    if (!user) return null;

    return { id: user.id, email: user.email };
  }

  async logout(rawToken: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    await this.sessionsRepo.deleteByTokenHash(tokenHash);
  }
}
