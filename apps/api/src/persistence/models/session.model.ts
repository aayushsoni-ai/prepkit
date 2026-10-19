export interface SessionModel {
  id: string;
  token_hash: string;
  user_id: string;
  expires_at: Date;
  created_at: string;
}
