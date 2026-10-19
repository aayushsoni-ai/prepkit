import { getDb } from "../db.js";
import { SessionModel } from "../models/session.model.js";

const memorySessions = new Map<string, SessionModel>();

export class SessionsRepository {
  async create(session: SessionModel): Promise<SessionModel> {
    try {
      const db = getDb();
      await db.collection<SessionModel>("sessions").insertOne({ ...session });
      return session;
    } catch {
      memorySessions.set(session.token_hash, session);
      return session;
    }
  }

  async findByTokenHash(tokenHash: string): Promise<SessionModel | null> {
    try {
      const db = getDb();
      return await db.collection<SessionModel>("sessions").findOne({ token_hash: tokenHash });
    } catch {
      return memorySessions.get(tokenHash) ?? null;
    }
  }

  async updateExpiry(tokenHash: string, newExpiry: Date): Promise<void> {
    try {
      const db = getDb();
      await db.collection<SessionModel>("sessions").updateOne(
        { token_hash: tokenHash },
        { $set: { expires_at: newExpiry } }
      );
    } catch {
      const sess = memorySessions.get(tokenHash);
      if (sess) {
        sess.expires_at = newExpiry;
      }
    }
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    try {
      const db = getDb();
      await db.collection<SessionModel>("sessions").deleteOne({ token_hash: tokenHash });
    } catch {
      memorySessions.delete(tokenHash);
    }
  }
}
