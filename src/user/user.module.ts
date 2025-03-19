import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtTokenService } from '../core/jwt-token/jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenEntity } from '../auth/entities/refresh-token.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      UserEntity,
      RefreshTokenEntity,
    ]),
  ],
  providers: [UserService, JwtTokenService, ConfigService],
  controllers: [UserController],
})
export class UserModule {}
