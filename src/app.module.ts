import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtTokenModule } from './core/jwt-token/jwt-token.module';
import { CommonModule } from './core/common/common.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './core/guards/roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    JwtTokenModule,
    CommonModule,
    MediaModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
