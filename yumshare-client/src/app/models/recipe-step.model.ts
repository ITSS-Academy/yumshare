import { Recipe } from './recipe.model';

export interface RecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  description: string;
  image_url?: string;
  video_url?: string;
  cooking_time: number;
  tips?: string;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  recipe?: Recipe;
}
