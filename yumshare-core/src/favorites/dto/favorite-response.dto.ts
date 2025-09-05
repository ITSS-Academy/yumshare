import { Recipe } from '../../recipes/entities/recipe.entity/recipe.entity';

export class FavoriteResponseDto {
  id: string;
  user_id: string;
  recipe_id: string;
  recipe: Recipe | null;
  created_at: Date;
  recipe_exists: boolean;
  recipe_deleted_at?: Date;
}
