import { Kit } from "../../domain/kit/schema.js";

export interface KitModel {
  _id: string;
  user_id: string;
  fingerprint: string;
  kit: Kit;
  snapshot?: Kit;
  updated_at: string;
}
