import { User } from './user.model';
import { Recipe } from './recipe.model';

export interface Comment {
  id: string;
  user_id: string;
  recipe_id: string;
  content: string;
  created_at: Date;
  
  // Relations
  user?: User;
  recipe?: Recipe;
  
  // Flattened user fields from backend response
  username?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}
    