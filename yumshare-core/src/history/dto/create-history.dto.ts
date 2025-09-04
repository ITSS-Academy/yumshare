import { IsString } from "class-validator";

export class CreateHistoryDto {
  @IsString()
  user_id: string;

  @IsString()
  recipe_id: string;
} 