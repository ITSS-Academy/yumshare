import { IsString, IsUUID } from 'class-validator';

export class CreateFollowDto {
  @IsString()
  follower_id: string;

  @IsString()
  following_id: string;
}