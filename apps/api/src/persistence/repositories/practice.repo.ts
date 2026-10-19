import { createId } from "../../domain/kit/ids.js";
import { CardPracticeRecord } from "../../domain/practice/buildQueue.js";
import { getDb } from "../db.js";
import { PracticeModel } from "../models/practice.model.js";

const memoryPractice = new Map<string, PracticeModel>();

export class PracticeRepository {
  async recordRating(userId: string, cardId: string, confidence: number): Promise<PracticeModel> {
    const model: PracticeModel = {
      _id: createId("prac"),
      user_id: userId,
      card_id: cardId,
      confidence,
      practiced_at: new Date().toISOString()
    };

    try {
      const db = getDb();
      await db.collection<PracticeModel>("practice").insertOne({ ...model });
      return model;
    } catch {
      memoryPractice.set(model._id, model);
      return model;
    }
  }

  async getHistoryMap(userId: string): Promise<Map<string, CardPracticeRecord>> {
    let records: PracticeModel[] = [];

    try {
      const db = getDb();
      records = await db.collection<PracticeModel>("practice").find({ user_id: userId }).toArray();
    } catch {
      records = Array.from(memoryPractice.values()).filter((p) => p.user_id === userId);
    }

    const map = new Map<string, CardPracticeRecord>();

    for (const item of records) {
      const existing = map.get(item.card_id);
      if (!existing) {
        map.set(item.card_id, {
          card_id: item.card_id,
          last_confidence: item.confidence,
          last_practiced_at: item.practiced_at,
          practice_count: 1
        });
      } else {
        existing.practice_count++;
        if (new Date(item.practiced_at).getTime() >= new Date(existing.last_practiced_at).getTime()) {
          existing.last_confidence = item.confidence;
          existing.last_practiced_at = item.practiced_at;
        }
      }
    }

    return map;
  }
}
