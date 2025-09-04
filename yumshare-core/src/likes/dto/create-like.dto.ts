import { IsString } from "class-validator";

export class CreateLikeDto {
  @IsString()
  user_id: string;

  @IsString()
  recipe_id: string;
}
