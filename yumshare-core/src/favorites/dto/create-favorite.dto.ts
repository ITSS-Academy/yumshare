import { IsString, IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  user_id: string;

  @IsString()
  @IsUUID()
  recipe_id: string;
}