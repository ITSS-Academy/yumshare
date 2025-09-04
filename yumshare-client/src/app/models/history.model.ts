import { User } from './user.model';
import { Recipe } from './recipe.model';

export interface History {
  id: string;
  user_id: string;
  recipe_id: string;
  viewed_at: Date;
  
  // Relations
  user?: User;
  recipe?: Recipe;
}
