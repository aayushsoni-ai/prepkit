import { getDb } from "../db.js";
import { UserModel } from "../models/user.model.js";

const memoryUsers = new Map<string, UserModel>();

export class UsersRepository {
  async findById(id: string): Promise<UserModel | null> {
    try {
      const db = getDb();
      return await db.collection<UserModel>("users").findOne({ id });
    } catch {
      return memoryUsers.get(id) ?? null;
    }
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const norm = email.toLowerCase().trim();
    try {
      const db = getDb();
      return await db.collection<UserModel>("users").findOne({ email: norm });
    } catch {
      for (const u of memoryUsers.values()) {
        if (u.email === norm) return u;
      }
      return null;
    }
  }

  async create(user: UserModel): Promise<UserModel> {
    try {
      const db = getDb();
      await db.collection<UserModel>("users").insertOne({ ...user });
      return user;
    } catch {
      memoryUsers.set(user.id, user);
      return user;
    }
  }

  async findByGoogleId(googleId: string): Promise<UserModel | null> {
    try {
      const db = getDb();
      return await db.collection<UserModel>("users").findOne({ google_id: googleId });
    } catch {
      for (const u of memoryUsers.values()) {
        if (u.google_id === googleId) return u;
      }
      return null;
    }
  }

  async updateGoogleId(id: string, googleId: string): Promise<void> {
    try {
      const db = getDb();
      await db.collection<UserModel>("users").updateOne({ id }, { $set: { google_id: googleId } });
    } catch {
      const u = memoryUsers.get(id);
      if (u) {
        u.google_id = googleId;
        memoryUsers.set(id, u);
      }
    }
  }
}
