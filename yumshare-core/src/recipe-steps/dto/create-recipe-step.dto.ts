export class CreateRecipeStepDto {
  step_number: number;
  description: string;
  image_url?: string;
  video_url?: string;
  cooking_time?: number;
  tips?: string;
}
