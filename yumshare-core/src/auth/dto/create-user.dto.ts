import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {
 @IsString()
  id: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  
}