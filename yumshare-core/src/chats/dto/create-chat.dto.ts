import { IsString, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  user1_id: string;

  @IsString()
  @IsNotEmpty()
  user2_id: string;
}
