export class CreateCategoryDto {
  name: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  sort_order?: number;
}
