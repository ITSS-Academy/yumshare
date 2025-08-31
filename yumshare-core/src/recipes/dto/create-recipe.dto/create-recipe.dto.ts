import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsArray, IsNumber, IsEnum, IsUUID, Min, Max, IsUrl } from 'class-validator';

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export class CreateRecipeDto {
  @IsString()
  user_id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  ingredients?: string[];
  
  @IsOptional()
  @IsUrl()
  image_url?: string;
  
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    return value;
  })
  video_url?: string;
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440) // 24 hours max
  total_cooking_time?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50) // Max 50 servings
  servings?: number;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsUUID()
  category_id?: string;
  
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  steps?: {
    step_number: number;
    description: string;
    image_url?: string;
    video_url?: string;
    cooking_time?: number;
    tips?: string;
  }[];
}