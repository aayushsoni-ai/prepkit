import { Kit } from "../../domain/kit/schema.js";
import { getDb } from "../db.js";
import { KitModel } from "../models/kit.model.js";

const memoryKits = new Map<string, KitModel>();

export class KitsRepository {
  async findById(kitId: string, userId: string): Promise<KitModel | null> {
    try {
      const db = getDb();
      return await db.collection<KitModel>("kits").findOne({ _id: kitId, user_id: userId });
    } catch {
      const model = memoryKits.get(kitId);
      if (!model || model.user_id !== userId) return null;
      return model;
    }
  }

  async findByFingerprint(userId: string, fingerprint: string): Promise<KitModel | null> {
    try {
      const db = getDb();
      return await db.collection<KitModel>("kits").findOne({ user_id: userId, fingerprint });
    } catch {
      for (const m of memoryKits.values()) {
        if (m.user_id === userId && m.fingerprint === fingerprint) return m;
      }
      return null;
    }
  }

  async findAllByUserId(userId: string): Promise<KitModel[]> {
    try {
      const db = getDb();
      return await db.collection<KitModel>("kits").find({ user_id: userId }).toArray();
    } catch {
      return Array.from(memoryKits.values()).filter((m) => m.user_id === userId);
    }
  }

  async create(kitModel: KitModel): Promise<KitModel> {
    try {
      const db = getDb();
      await db.collection<KitModel>("kits").insertOne({ ...kitModel });
      return kitModel;
    } catch {
      memoryKits.set(kitModel._id, kitModel);
      return kitModel;
    }
  }

  async updateWithVersion(
    kitId: string,
    userId: string,
    expectedVersion: number,
    updatedKit: Kit,
    snapshot?: Kit
  ): Promise<boolean> {
    updatedKit.version = expectedVersion + 1;
    const now = new Date().toISOString();

    try {
      const db = getDb();
      const res = await db.collection<KitModel>("kits").updateOne(
        { _id: kitId, user_id: userId, "kit.version": expectedVersion },
        {
          $set: {
            kit: updatedKit,
            updated_at: now,
            ...(snapshot ? { snapshot } : {})
          }
        }
      );
      return res.modifiedCount > 0;
    } catch {
      const existing = memoryKits.get(kitId);
      if (!existing || existing.user_id !== userId || existing.kit.version !== expectedVersion) {
        return false;
      }
      if (snapshot) existing.snapshot = snapshot;
      existing.kit = updatedKit;
      existing.updated_at = now;
      return true;
    }
  }

  async restoreSnapshot(kitId: string, userId: string): Promise<KitModel | null> {
    const existing = await this.findById(kitId, userId);
    if (!existing || !existing.snapshot) return null;

    const restoredKit = { ...existing.snapshot, version: existing.kit.version + 1 };
    const success = await this.updateWithVersion(kitId, userId, existing.kit.version, restoredKit);
    return success ? await this.findById(kitId, userId) : null;
  }
}
