import { IsString } from "class-validator";

export class CreateCommentDto {
  @IsString()  // ✅ Có decorator
  user_id: string;

  @IsString()  // ✅ Có decorator  
  recipe_id: string;

  @IsString()  // ✅ Có decorator
  content: string;
}