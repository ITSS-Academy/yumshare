export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}
