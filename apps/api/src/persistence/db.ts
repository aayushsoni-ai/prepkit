import { Db, MongoClient } from "mongodb";
import { getEnv } from "../config/env.js";

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectToDatabase(customUri?: string): Promise<Db> {
  if (database) return database;

  const uri = customUri ?? getEnv().MONGODB_URI;
  client = new MongoClient(uri);
  await client.connect();
  database = client.db();
  return database;
}

export function getDb(): Db {
  if (!database) {
    throw new Error("Database not connected. Call connectToDatabase first.");
  }
  return database;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}
