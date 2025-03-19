import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { JwtTokenService } from '../core/jwt-token/jwt-token.service';
// import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

@Module({
  imports: [
    JwtModule.register({}),
    // HttpModule,
    TypeOrmModule.forFeature([
      UserEntity,
      RefreshTokenEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    JwtTokenService,
    ConfigService,
  ],
})
export class AuthModule {}
