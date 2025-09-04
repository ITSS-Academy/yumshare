import { Recipe } from './recipe.model';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  recipes?: Recipe[];
}
