import { User } from './user.model';
import { Recipe } from './recipe.model';

export interface Bookmark {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: Date;
  
  // Relations
  user?: User;
  recipe?: Recipe;
}
