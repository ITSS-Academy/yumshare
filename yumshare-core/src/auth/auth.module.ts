import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([User])
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
  exports: [UsersService],
})
export class AuthModule {}
