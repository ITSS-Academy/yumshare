import { User } from './user.model';
import { Category } from './category.model';
import { RecipeStep } from './recipe-step.model';

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  ingredients?: string[];
  image_url?: string;
  video_url?: string;
  total_cooking_time: number;
  servings: number;
  difficulty?: string;
  category_id?: string;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  user?: User;
  category?: Category;
  steps?: RecipeStep[];
}
