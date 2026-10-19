export interface UserModel {
  id: string;
  email: string;
  password_hash?: string;
  google_id?: string;
  created_at: string;
}
