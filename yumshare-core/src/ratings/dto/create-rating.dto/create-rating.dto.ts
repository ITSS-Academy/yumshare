import { IsString, IsNumber, IsOptional, Min, Max, IsUUID } from 'class-validator';

export class CreateRatingDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  recipe_id: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number; // Changed from 'score' to 'rating'

  @IsOptional()
  @IsString()
  comment?: string; // Added comment field
}